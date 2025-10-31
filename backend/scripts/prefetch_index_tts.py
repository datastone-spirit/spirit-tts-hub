import os
import sys
import argparse
from pathlib import Path


def _add_index_tts_to_syspath(backend_dir: Path) -> None:
    """
    Ensure `indextts` can be imported even if `index-tts` hasn't been installed.
    Adds `<backend>/index-tts` to `sys.path` at runtime.
    """
    index_tts_dir = backend_dir / "index-tts"
    if str(index_tts_dir) not in sys.path:
        sys.path.insert(0, str(index_tts_dir))


def _prefetch_remote(cfg_path: Path) -> None:
    """
    Prefetch remote weights referenced by IndexTTS without full model construction.
    - SeamlessM4TFeatureExtractor (facebook/w2v-bert-2.0)
    - MaskGCT semantic codec (amphion/MaskGCT)
    - CAMPPlus (funasr/campplus)
    - BigVGAN vocoder from cfg.vocoder.name
    """
    from omegaconf import OmegaConf
    from huggingface_hub import hf_hub_download
    from transformers import SeamlessM4TFeatureExtractor
    from indextts.s2mel.modules.bigvgan import bigvgan

    cfg = OmegaConf.load(str(cfg_path))

    # Download feature extractor
    SeamlessM4TFeatureExtractor.from_pretrained("facebook/w2v-bert-2.0")

    # Download semantic codec weights
    hf_hub_download("amphion/MaskGCT", filename="semantic_codec/model.safetensors")

    # Download CAMPPlus weights
    hf_hub_download("funasr/campplus", filename="campplus_cn_common.bin")

    # Download BigVGAN vocoder weights
    bigvgan.BigVGAN.from_pretrained(cfg.vocoder.name, use_cuda_kernel=False)

    print("[prefetch] Remote weights prefetch completed.")


def _full_init(cfg_path: Path, model_dir: Path, device: str = "cpu", use_fp16: bool = False,
               use_cuda_kernel: bool = False, use_deepspeed: bool = False) -> None:
    """
    Perform a full CPU init of IndexTTS2 to trigger all downloads and local loads.
    This will attempt to load local checkpoints under `model_dir` in addition to remote weights.
    """
    from indextts.infer_v2 import IndexTTS2

    IndexTTS2(
        cfg_path=str(cfg_path),
        model_dir=str(model_dir),
        device=device,
        use_fp16=use_fp16,
        use_cuda_kernel=use_cuda_kernel,
        use_deepspeed=use_deepspeed,
    )
    print("[prefetch] Full init prefetch completed.")


def main() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    default_cfg = backend_dir / "index-tts" / "checkpoints" / "config.yaml"
    default_model_dir = backend_dir / "index-tts" / "checkpoints"
    default_hf_cache = backend_dir / "checkpoints" / "hf_cache"

    parser = argparse.ArgumentParser(description="Prefetch IndexTTS weights before app startup.")
    parser.add_argument("--cfg", type=Path, default=default_cfg, help="Path to config.yaml")
    parser.add_argument("--model-dir", type=Path, default=default_model_dir,
                        help="Model directory containing local checkpoints (for full init)")
    parser.add_argument("--hf-cache", type=Path, default=default_hf_cache, help="HF cache directory")
    parser.add_argument("--full-init", action="store_true",
                        help="Run full IndexTTS2 init on CPU to prefetch remote + local")
    parser.add_argument("--device", default="cpu", help="Device for full init, e.g. cpu or cuda:0")
    parser.add_argument("--use-fp16", action="store_true", help="Use fp16 for full init (ignored on cpu)")
    parser.add_argument("--use-cuda-kernel", action="store_true", help="Use BigVGAN CUDA kernel (CUDA only)")
    parser.add_argument("--use-deepspeed", action="store_true", help="Use DeepSpeed if available")
    parser.add_argument("--offline", action="store_true",
                        help="Set offline env (HF_HUB_OFFLINE, TRANSFORMERS_OFFLINE) after prefetch to prevent re-downloads")
    parser.add_argument("--maskgct-revision", default=None, help="Optional HuggingFace revision for amphion/MaskGCT")
    parser.add_argument("--campplus-revision", default=None, help="Optional revision for funasr/campplus")
    parser.add_argument("--w2v-bert-revision", default=None, help="Optional revision for facebook/w2v-bert-2.0")

    args = parser.parse_args()

    # Ensure HF cache directory and set env
    args.hf_cache.mkdir(parents=True, exist_ok=True)
    cache_path = str(args.hf_cache)
    # Unify huggingface/transformers cache envs to the same directory
    os.environ["HF_HUB_CACHE"] = cache_path
    os.environ["HUGGINGFACE_HUB_CACHE"] = cache_path  # alias used by some setups
    os.environ["HF_HOME"] = cache_path
    os.environ["TRANSFORMERS_CACHE"] = cache_path

    if args.offline:
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        os.environ["HF_LOCAL_ONLY"] = "1"

    # Optional revision pins to avoid fetching latest
    if args.maskgct_revision:
        os.environ["MASKGCT_REVISION"] = args.maskgct_revision
    if args.campplus_revision:
        os.environ["CAMPPLUS_REVISION"] = args.campplus_revision
    if args.w2v_bert_revision:
        os.environ["W2V_BERT_REVISION"] = args.w2v_bert_revision

    # Make sure `indextts` can be imported
    _add_index_tts_to_syspath(backend_dir)

    if args.full_init:
        _full_init(
            cfg_path=args.cfg,
            model_dir=args.model_dir,
            device=args.device,
            use_fp16=args.use_fp16,
            use_cuda_kernel=args.use_cuda_kernel,
            use_deepspeed=args.use_deepspeed,
        )
    else:
        _prefetch_remote(cfg_path=args.cfg)

    # Print summary and recommended .env lines
    print("\n[prefetch] Cache directory:", cache_path)
    print("[prefetch] Offline:", "enabled" if args.offline else "disabled")
    print("[prefetch] Recommended backend/.env entries:")
    print(f"  HF_HUB_CACHE={cache_path}")
    print(f"  HUGGINGFACE_HUB_CACHE={cache_path}")
    print(f"  HF_HOME={cache_path}")
    print(f"  TRANSFORMERS_CACHE={cache_path}")
    if args.offline:
        print("  HF_HUB_OFFLINE=1")
        print("  TRANSFORMERS_OFFLINE=1")
        print("  HF_LOCAL_ONLY=1")
    if args.maskgct_revision:
        print(f"  MASKGCT_REVISION={args.maskgct_revision}")
    if args.campplus_revision:
        print(f"  CAMPPLUS_REVISION={args.campplus_revision}")
    if args.w2v_bert_revision:
        print(f"  W2V_BERT_REVISION={args.w2v_bert_revision}")


if __name__ == "__main__":
    main()