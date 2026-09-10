# 六爻800例 资料库

从《六爻800例—高级技法解析》（淮源子，782 页 PDF）提取的结构化语料 + 规则表 + 可复跑管线。

```
corpus/
  book.txt        782 页全文（带页标记，可读）
  pages.jsonl     782 页，阅读顺序原文（案例头不被换行切断）
  cases.jsonl     603 个卦例，结构化
  rules.jsonl     748 条断法条文
reference/
  gua64.json      64 卦纳甲/六亲/世应完整基础表
pipeline/
  build_gidmap.py 从 PDF 收割字形→Unicode 映射
  gid2uni_final.json  1809 个字形的最终映射（已人工校对）
  extract.py      带字形修复的文本提取
  flat.py         阅读顺序平铺提取
  segment.py      案例切分
  rules.py        规则条文抽取
  gua64.py        64 卦表生成器（京房纳甲）
  gua_ocr.py      卦盘图片识别（半成品，见下）
```

## 一、这个 PDF 的坑，以及怎么填的

calibre 把 CJK 字体拆成 **2179 个 Type3 子集**，并给大量字形写了 `ToUnicode → U+0000`。
直接 `pdftotext` 会丢 **36% 的字符**，而且丢的正好是最关键的那些：
世、应、官、父、母、兄、弟、卦、酉、亥、空、冲、合……

四步修复：

| 步骤 | 恢复 | 方法 |
|---|---|---|
| 跨子集收割 | 962 字形 | 同一 GID 在别的子集有正确 ToUnicode，全局对齐（0 冲突） |
| 锚点偏移 | 161 字形 | 用系统 Noto CJK 的 CID 顺序 + 已知锚点推算区间偏移 |
| 位图模板匹配 | 610 字形 | 渲染候选字与 PDF 字形做高斯模糊余弦比对 |
| 人工目视校对 | 全部 | 逐张对照图核对，共改正 **91 个**误判 |

外加：康熙部首折叠（⽘→爻、⻤→鬼、⺒→巳 等 21 个）。

**验证**：修复后的第 21 页与页面渲染图**逐字一致**。全书 0 个残留 NUL，
1831 个不同字符，罕用字清单人工扫过一遍，无乱码。

## 二、卦盘是图片

每页的卦盘表格是**嵌入的 JPEG**（1181×376，249ppi），不在文字层里。
但这不重要 —— 因为卦盘几乎全部可以算出来：

只要认出**本卦名**和**变卦名**，六亲、纳甲、世应、动爻、六神、伏神
全部由 `gua64.json` + 四柱推导。已用书中卦例校验通过（见 `gua64.py` 底部）。

`gua_ocr.py` 走的就是这条路：切列 → OCR → 用 64 卦的纳甲指纹打分排名，
**不要求 OCR 认对每个字**，错三四个字排名依然稳。

现状：**能跑，但召回率还不够**。本卦识别在测试页上基本正确（水风井、泽雷随、
山天大畜等），变卦经常漏（列切分把两列并到一起 / 阈值偏严）。
需要再迭代一轮：列切分改成按已知的三段式版面定位，打分阈值放宽 + 加入卦名头部 OCR 交叉验证。

## 三、还没做的

1. **卦盘识别收尾** — `gua_ocr.py` 调通后跑全书，把 `ben_gua/bian_gua/dong_yao` 回填进 `cases.jsonl`
2. **断语标签体系** — 从 `analysis` 里抽「财爻持世」「三刑」「三合局」「岁破」「入墓」「合走」等标签，与 `rules.jsonl` 双向挂钩
3. **事类归一化** — `question_raw` → `question_type` + `yongshen`
4. **终身卦章的规则抽取偏多**（320 条），那一章正文被当成条文吞进去了，需要单独处理
5. 索引层（见 SCHEMA.md）

## 四、复跑

```bash
pip install pdfplumber pypdfium2 pytesseract fonttools scipy pillow numpy
apt-get install -y tesseract-ocr-chi-sim fonts-noto-cjk poppler-utils

python build_gidmap.py          # 生成 gid2uni.json
# （字形校对已固化在 gid2uni_final.json，无需重跑）
python flat.py 0 784 flat_0.jsonl
python segment.py
python rules.py
```

## 五、数据来源与用途

原书受版权保护。这里的 `corpus/` 是从用户自有 PDF 提取的私有工作副本，
仅供个人研究与自用 app 的规则/检索底稿，不应再分发。
