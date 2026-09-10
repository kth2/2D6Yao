# 六爻资料库 Schema

## 设计原则

**能算的不存，只存算不出来的。**

一个卦盘里的绝大部分信息是确定性可推的：

| 信息 | 来源 | 是否需要存 |
|---|---|---|
| 六亲、纳甲、五行 | 卦名 → 京房纳甲 | ❌ 算 |
| 世应爻位 | 卦名 → 八宫世位 | ❌ 算 |
| 动爻位置 | 本卦 vs 变卦 逐爻比对 | ❌ 算 |
| 六神排列 | 日干 → 起六神 | ❌ 算 |
| 伏神 | 卦宫 + 缺失六亲 | ❌ 算 |
| 旬空 | 日柱 → 旬首 | ❌ 算（书中也印了，可交叉校验）|
| **四柱、本卦名、变卦名** | 原书 | ✅ 存 |
| **问事、断语、应期** | 原书 | ✅ 存 |

所以案例记录只需要 `四柱 + 本卦 + 变卦 + 文本`，卦盘由 `reference/gua64.json` 现算。
App 里同一套引擎既用来复现书中卦例，也用来给用户起卦 —— 一份代码两用。

---

## `corpus/cases.jsonl`

一行一例，603 条。

```jsonc
{
  "seq": 12,                    // 全书顺序号（唯一）
  "book_no": 12,                // 书中章内编号（章内唯一，可为 null）
  "variant": "",                // 少数例子带 # * A: B: 等标记
  "chapter": "一",
  "chapter_name": "财运",
  "page": 21,                   // PDF 页码，便于回溯原书
  "sizhu": { "year": "壬寅", "month": "乙巳", "day": "丙寅", "hour": "癸巳" },
  "xunkong": ["戌", "亥"],
  "question_raw": "海南侯先生摇卦问财运？",
  "analysis": "财爻戌土持世，得月建之生不弱……",   // 「解析：」正文
  "note": null,                 // 「注释：」段（作者的方法论点评，很有价值）
  "yingqi": [                   // 应期时间线，从 analysis 里切出
    { "ganzhi": "丙申", "text": "官鬼临太岁旺，又构成寅巳申三刑，因官非破财耗财。" }
  ],
  "header_raw": "12.壬寅 乙巳 丙寅 癸巳时（戌亥空），海南侯先生摇卦问财运？",
  "char_span": [6755, 7157]     // 在 book.txt 中的字符区间
}
```

**待补字段**（下一步）：

```jsonc
  "ben_gua": "水风井",
  "bian_gua": "水泽节",
  "dong_yao": [1, 3],
  "question_type": "财运",       // 归一化事类
  "yongshen": "妻财",            // 用神六亲
  "tags": ["财爻持世", "三刑", "三合局", "玄武暗昧之财"]
```

## `corpus/rules.jsonl`

748 条，作者自己列的编号断法条目（各章「断X方法技巧 / 信息提示 / 断语」）。

```jsonc
{ "id": "一-3", "chapter": "一", "chapter_name": "财运", "index": 3,
  "text": "兄弟持世全凭实力，有利投资。会有所耗费，宜合作，防口舌，越旺越有利……" }
```

这是规则库的**第一层**：书里已经把规律写成条文了，不用我们从案例里反推。
第二层（`tags` ↔ `rule_id` 的双向链接）需要人工/LLM 标注一轮。

## `corpus/pages.jsonl` / `book.txt`

782 页修复后的全文。`pages.jsonl` 保留页边界与阅读顺序（案例头不会被换行切断），
`book.txt` 是带 `<<<PAGE n>>>` 标记的可读版。

## `reference/gua64.json`

64 卦完整基础表。每卦：

```jsonc
"水风井": {
  "gong": "震", "gong_wuxing": "木", "shi_class": "五世",
  "inner": "巽", "outer": "坎",
  "lines": [0,1,1,0,1,0],        // 初爻→上爻，1=阳
  "shi": 5, "ying": 2,
  "yao": [
    { "pos":1, "yin_yang":"阴", "gan":"辛", "zhi":"丑", "wuxing":"土", "liuqin":"妻财" },
    ...
  ]
}
```

已用书中卦例逐爻校验（六亲、纳甲、世应、阴阳全中）。

---

## 建议的检索层

```
index/
  by_type/        问事类别 → case ids
  by_gua/         本卦 → case ids（同卦不同断，最见功夫）
  by_tag/         断语标签 → case ids + rule ids
  embeddings/     analysis 段落向量，用于「和这个卦象类似的书例」
```

App 出断语时的调用链：

```
用户起卦
  → 引擎算出完整卦盘（gua64.json + 四柱）
  → 规则匹配（rules.jsonl，命中条文）
  → 检索相似书例（by_gua + by_tag + 向量）
  → LLM 只负责把「命中的条文 + 引用的书例」组织成人话
```

LLM 不做推理，只做措辞。断错了能追到是哪条规则、哪个书例，可修可查。


---

## 卦盘挂接（已完成）

`corpus/cases.jsonl` 里每条已带 `gua` 字段：

```jsonc
"gua": {
  "ben": "水风井", "bian": "水泽节", "dong_yao": [1, 3],
  "gong": "震", "shi": 5, "ying": 2,
  "source_page": 21,
  "ocr_margin": 8,                                  // OCR 第一名与第二名的分差
  "text_check": { "ratio": 1.0, "hit": 4, "claims": 4 },  // 正文佐证命中率
  "confidence": "high"
}
```

`confidence` 的判定：

| 值 | 条件 | 数量 |
|---|---|---|
| `high` | 正文点名 ≥3 个爻，命中率 ≥0.6 | 160 |
| `medium` | 正文佐证 ≥3 条但命中率中等，或 OCR 分差 ≥5 | 281 |
| `low` | 佐证不足且 OCR 分差小 | 64 |
| `review` | 正文佐证 ≥3 条却命中率 <0.3，附 `text_best_alt` 候选 | 36 |
| `null` | 该例未找到卦盘图 | 62 |

**两条相互独立的校验**：

1. OCR 读到的动爻标记（`0` / `x`）个数 vs 本卦、变卦逐爻比对得出的动爻数 —— **502 例全部一致，0 例冲突**
2. 解析正文点名的爻（「官鬼申金」「财爻戌土持世」「五爻亥水」）vs 认出的卦的六亲纳支 —— 这条与 OCR 完全无关

## 标签体系

41 个标签，四组：

- `yongshen_*` 用神体系：`yongshen_chishi`（谁持世，明细在 `tag_detail.chishi`）、`yongshen_declared`、`jishen`、`yuanshen`、`buashanggua`、`liangxian`
- 旺衰状态：`wangxiang` `shuairuo` `xunkong` `chukong` `tianshi` `suipo` `yuepo` `ripo` `rumu` `kaiku`
- 爻间关系：`sanxing` `liuchong` `liuhe` `sanhe_ju` `sanhui_ju` `huitou_sheng` `huitou_ke` `jinshen` `tuishen` `tongguan` `andong` `hezou` `kexie_jiaojia` `shiying`
- 格局与外部：`taisui` `yuejian` `richen` `fushen` `fanyin` `fuyin` `cong_ge` `youhun` `guihun` `dufa` `liushen`

标签只标「有没有出现」这个事实，不做吉凶判断 —— 吉凶留给规则库。

规则条文用**同一套标签**，于是两边可以互查：

- `cases[].related_rules` → `[{rule_id, shared_tags, same_chapter}]`（同章优先）
- `rules[].example_cases` → `[case_seq]`

## `corpus/index.json`

```jsonc
{
  "case_by_tag":  { "sanhe_ju": [12, 18, ...] },
  "rule_by_tag":  { "sanhe_ju": ["一-一1-31", ...] },
  "case_by_gua":  { "水风井": [12, ...] },        // 62 个不同本卦
  "case_by_chapter": { "财运": [...] }
}
```

## `reference/gua_tables.jsonl`

670 张卦盘的识别结果原始记录（页码、图序、本卦、变卦、动爻、OCR 分数），
便于回查与重标。
