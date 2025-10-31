import re
import logging
from typing import List, Dict, Any

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TokenParser:
    """文本token解析器"""
    
    def __init__(self):
        """初始化token解析器"""
        # 不同模型的分词器配置
        self.tokenizers = {
            "index-tts": self._index_tts_tokenize
            # 可以添加其他模型的分词器
        }
    
    def parse(self, text: str, model_name: str = "index-tts") -> List[Dict[str, Any]]:
        """
        解析文本的token
        
        Args:
            text: 要解析的文本
            model_name: TTS模型名称
            
        Returns:
            List[Dict]: token列表，每个token包含文本和其他属性
        """
        tokenizer = self.tokenizers.get(model_name, self._default_tokenize)
        return tokenizer(text)
    
    def _index_tts_tokenize(self, text: str) -> List[Dict[str, Any]]:
        """
        使用IndexTTS的方式进行分词
        
        Args:
            text: 要分词的文本
            
        Returns:
            List[Dict]: token列表
        """
        # 这里应该使用IndexTTS的实际分词逻辑
        # 由于我们没有实际的模型，所以使用简单的规则进行模拟
        
        # 1. 处理标点符号
        punctuation = r'[,.!?;:，。！？；：]'
        # 2. 处理中文字符
        chinese = r'[\u4e00-\u9fff]'
        # 3. 处理英文单词
        english_word = r'[a-zA-Z]+'
        # 4. 处理数字
        number = r'\d+'
        # 5. 处理空白字符
        whitespace = r'\s+'
        
        # 组合所有模式
        pattern = f"({punctuation}|{chinese}|{english_word}|{number}|{whitespace})"
        
        # 使用正则表达式进行分词
        tokens_raw = re.findall(pattern, text)
        
        # 构建token列表
        tokens = []
        position = 0
        
        for token_text in tokens_raw:
            # 跳过空白字符
            if re.match(r'^\s+$', token_text):
                position += len(token_text)
                continue
                
            token_type = "word"
            if re.match(punctuation, token_text):
                token_type = "punctuation"
            elif re.match(chinese, token_text):
                token_type = "chinese"
            elif re.match(english_word, token_text):
                token_type = "english"
            elif re.match(number, token_text):
                token_type = "number"
            
            token = {
                "text": token_text,
                "type": token_type,
                "start": position,
                "end": position + len(token_text),
                "length": len(token_text)
            }
            
            tokens.append(token)
            position += len(token_text)
        
        return tokens
    
    def _default_tokenize(self, text: str) -> List[Dict[str, Any]]:
        """
        默认的分词方法，简单地按空格分词
        
        Args:
            text: 要分词的文本
            
        Returns:
            List[Dict]: token列表
        """
        words = text.split()
        tokens = []
        position = 0
        
        for word in words:
            # 查找单词在原文中的实际位置
            word_start = text.find(word, position)
            if word_start == -1:
                word_start = position
            
            token = {
                "text": word,
                "type": "word",
                "start": word_start,
                "end": word_start + len(word),
                "length": len(word)
            }
            
            tokens.append(token)
            position = word_start + len(word)
        
        return tokens