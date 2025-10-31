import os
import mimetypes
import pathlib
import logging


"""
公共工具函数模块
包含项目中通用的工具方法
"""

def getprojectpath() -> str:
     return str(pathlib.Path(__file__).parent.parent)

def setup_logging(args=None, log_level=None, reset=False):
     if logging.root.handlers:
          if reset:
            # remove all handlers
               for handler in logging.root.handlers[:]:
                    logging.root.removeHandler(handler)
          else:
               return
    # log_level can be set by the caller or by the args, the caller has priority. If not set, use INFO
     if log_level is None:
        log_level = "INFO"
     log_level = getattr(logging, log_level)

     handler = logging.StreamHandler(sys.stdout)  # same as print
     handler.propagate = False

     formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(module)-16s | %(message)-180s',
        datefmt='%Y-%m-%d %H:%M:%S'
     )
     handler.setFormatter(formatter)
     logging.root.setLevel(log_level)
     logging.root.addHandler(handler)

def res(data=None, message="Ok", success=True, code=200):
    """
    统一的API响应格式
    
    Args:
        data: 响应数据
        message: 响应消息
        success: 是否成功
        code: 状态码
    
    Returns:
        dict: 格式化的响应字典
    """
    return {
        "success": success,
        "message": message,
        "data": data,
        "code": code
    }

def error_res(message="Error", code=400, data=None):
    """
    错误响应的快捷方法
    
    Args:
        message: 错误消息
        code: 错误状态码
        data: 错误相关数据
    
    Returns:
        dict: 格式化的错误响应字典
    """
    return res(data=data, message=message, success=False, code=code)

def success_res(data=None, message="Success"):
    """
    成功响应的快捷方法
    
    Args:
        data: 响应数据
        message: 成功消息
    
    Returns:
        dict: 格式化的成功响应字典
    """
    return res(data=data, message=message, success=True, code=200)


def pathFormat(path: str) -> str:
     # 处理路径，确保拼接的是绝对路径
     full_path = path
     if not os.path.isabs(path):
          full_path = os.path.normpath(os.path.join(getprojectpath(), path))
     return full_path

def get_directory_structure(directory, url=""):
    """
        返回当前目录层级的文件和目录结构
        :param directory: 要扫描的目录路径
        :param type: 返回的结构类型，index 表示返回文件和目录，subfolders 表示只返回目录
        :param url: 当前请求的域名
    """
    try:
        items = sorted(os.listdir(directory), key=lambda x: (not os.path.isdir(os.path.join(directory, x)), x))  # 获取指定目录下的所有项（文件和目录），并将目录放在前面
        result = []  # 存放最终的结果

        for item in items:
            try:
                item_path = os.path.join(directory, item)
                item_stat = os.stat(item_path)
                # logger.info(f"item_stat-------------------------- is {item_stat}")
                item_info = {
                    "basename": os.path.basename(item_path),
                    "extension": os.path.splitext(item_path)[1],
                    "extra_metadata": [],
                    "last_modified": int(item_stat.st_mtime),
                    "path": f"{item_path}",
                    "type": "dir" if os.path.isdir(item_path) else "file",
                    "visibility": "public",
                }
                if os.path.isdir(item_path):
                    result.append(item_info)
                elif os.path.isfile(item_path):
                    item_info["file_size"] = item_stat.st_size
                    item_info["mime_type"] = mimetypes.guess_type(item_path)[0]
                    if item_info["extension"].lower() in {".png", ".jpg", ".jpeg", ".gif"}:
                        item_info["url"] = f"{url}api/image{item_path}"
                    result.append(item_info)
            except Exception as e:
                # logger.warning(f"get directory structure failed, error:{str(e)}")
                continue
        else:
            return {
                "storages": ["local"],
                "adapter": "local",
                "dirname": directory,
                "files": result
            }

    except Exception as e:
        # logger.warning(f"get directory structure failed, error:", exc_info=e)
        return {"error": str(e)}
