import type { PromptOptions } from "@openuidev/react-lang";
import { demoToolSpecs } from "./demo-data";

/**
 * 提示模型生成可直接操作的工具界面：页面把输入与清单保存在 $variables 中，
 * 并使用 @functions 计算结果，无需再向助手发送消息。
 */

export const exampleShoppingList = `root = Card([title, stepper, list, copy])
$guests = 4
$got = []
title = Title("意面之夜 · " + @Plural($guests, "位客人"), "lg")
stepper = Row([IconButton("minus", @Set($guests, @Clamp($guests - 1, 1, 20)), "减少人数"), Text($guests + "", "lg", null, "semibold"), IconButton("plus", @Set($guests, @Clamp($guests + 1, 1, 20)), "增加人数")], 3)
lines = @Each(base, "i", {name: i.name, qty: @Round(i.qty * $guests / 4) + i.unit})
list = Col(@Each(lines, "l", Pressable([Row([Icon(@Includes($got, l.name) ? "check-circle" : "circle", "sm"), Text(l.qty + " " + l.name, "sm", null, null, false, @Includes($got, l.name))], 2)], @Set($got, @Toggle($got, l.name)), @Includes($got, l.name), 2)), 1)
copy = Button("复制清单", @CopyToClipboard(@Join(@Each(lines, "l", l.qty + " " + l.name), "\\n")), "outline", null, "sm", "copy")
base = [{name: "意大利面", qty: 400, unit: " g"}, {name: "番茄", qty: 6, unit: ""}, {name: "帕玛森奶酪", qty: 80, unit: " g"}]`;

export const exampleTrip = `root = Col([title, intro, photos, facts, Title("每日行程", "md"), days, prefs])
$pace = "悠闲"
title = Title("里斯本三日游", "xl")
intro = Text("沿着山坡、彩砖立面与特茹河开启旅程：从**阿尔法玛**出发，留一天游览贝伦，再乘火车前往辛特拉。")
photos = Carousel([SearchImage("Alfama Lisbon", 1.25), SearchImage("Belém Tower", 1.25), SearchImage("Pena Palace", 1.25)], 260)
facts = Row([Badge("4 月至 6 月最适合前往"), Badge("28 路电车", "info"), Badge("每天约 €120", "success")], 2, null, null, true)
days = Col(@Each(plan, "d", Row([Box([SearchImage(d.place, 1, "lg")], null, null, null, null, null, null, 96), Col([Text([Icon("map-pin", "sm"), "第 " + d.day + " 天 · " + d.title], "md", null, "semibold"), Text(d.text, "sm", "muted")], 1)], 4, "start")), 4)
prefs = Card([Title("按喜好调整", "sm"), Form([RadioGroup($pace, ["悠闲", "紧凑"], "节奏", "pills"), Button("调整行程", @ToAssistant("请帮我调整里斯本行程"))])], "soft")
plan = [{day: 1, title: "阿尔法玛", place: "São Jorge Castle", text: "登上城堡俯瞰全城，再享用烤沙丁鱼午餐。"}, {day: 2, title: "贝伦", place: "Jerónimos Monastery", text: "参观修道院与贝伦塔，再品尝当地特色蛋挞。"}, {day: 3, title: "辛特拉", place: "Pena Palace", text: "从罗西乌车站乘火车出发，记得预约上午 9 点的宫殿门票。"}]`;

export const exampleSteps = `root = Col([head, viewer, strip])
$step = 0
head = Col([Title("组装一座小书架", "xl"), Text("共四步，大约需要 30 分钟。准备好包装内的内六角扳手和一把锤子。", "md", "muted")], 2)
steps = [{title: "摆放零件", text: "准备两块侧板、顶板、一块层板和底板。将 12 根木榫轻敲进侧板的孔中。"}, {title: "先装好一侧板", text: "将顶板、层板和底板套到一侧板的木榫上，再顺时针旋紧偏心锁，直到连接牢固。"}, {title: "装上另一侧板", text: "将另一块侧板对准剩余木榫装上，并用相同方法旋紧偏心锁。"}, {title: "钉上背板", text: "将书架正面朝下放置，确认各角方正，再每隔约 10 厘米钉上背板。"}]
s0 = Svg([Rect(16, 20, 22, 120, "surface", "ink", 2), Rect(48, 20, 22, 120, "surface", "ink", 2), Rect(100, 28, 120, 16, "surface", "ink", 2), Rect(100, 68, 120, 16, "surface", "ink", 2), Rect(100, 108, 120, 16, "surface", "ink", 2), Circle(27, 36, 3, "chart1"), Circle(27, 80, 3, "chart1"), Circle(27, 124, 3, "chart1"), SvgText("侧板", 43, 154, 11, "muted", "middle"), SvgText("顶板", 160, 22, 11, "muted", "middle"), SvgText("层板", 160, 62, 11, "muted", "middle"), SvgText("底板", 160, 102, 11, "muted", "middle")], "0 0 240 160")
s1 = Svg([Rect(40, 16, 18, 128, "surface", "ink", 2), Rect(58, 16, 130, 14, "surface", "ink", 2), Rect(58, 72, 130, 14, "surface", "ink", 2), Rect(58, 130, 130, 14, "surface", "ink", 2), Circle(68, 23, 4, "info"), Circle(68, 79, 4, "info"), Circle(68, 137, 4, "info"), Line(212, 79, 196, 79, "info", 2), Polygon("192,79 200,74 200,84", "info"), SvgText("偏心锁", 74, 104, 11, "info")], "0 0 240 160")
s2 = Svg([Rect(40, 16, 18, 128, "surface", "ink", 2), Rect(58, 16, 130, 14, "surface", "ink", 2), Rect(58, 72, 130, 14, "surface", "ink", 2), Rect(58, 130, 130, 14, "surface", "ink", 2), Rect(196, 16, 18, 128, "surface", "info", 2), Line(232, 80, 220, 80, "info", 2), Polygon("216,80 224,75 224,85", "info")], "0 0 240 160")
s3 = Svg([Rect(40, 16, 160, 128, "#EFE9DF", "ink", 2), Rect(40, 16, 160, 14, "surface", "ink", 2), Rect(40, 72, 160, 14, "surface", "ink", 2), Rect(40, 130, 160, 14, "surface", "ink", 2), Circle(48, 50, 2.5, "ink"), Circle(192, 50, 2.5, "ink"), Circle(48, 108, 2.5, "ink"), Circle(192, 108, 2.5, "ink"), SvgText("背板", 120, 56, 11, "muted", "middle")], "0 0 240 160")
drawings = [s0, s1, s2, s3]
viewer = Card([Row([Badge("第 " + ($step + 1) + " 步，共 4 步", "info"), Spacer(), Caption(@Percent($step + 1, 4) + "% 已完成")], 2), Box([drawings[$step]], null, null, 3, "surface", "lg"), Title(steps[$step].title, "md"), Text(steps[$step].text, "sm"), Row([Button("上一步", @Set($step, @Clamp($step - 1, 0, 3)), "outline", null, null, "arrow-left", $step == 0), Spacer(), Button("下一步", @Set($step, @Clamp($step + 1, 0, 3)), "solid", null, null, "arrow-right", $step == 3)], 2)], null, 4, 3)
strip = Grid(@Each(@Range(0, 4), "i", Pressable([drawings[i], Caption((i + 1) + ". " + steps[i].title)], @Set($step, i), i == $step, 2)), 4, 110, 2)`;

export const exampleDashboard = `root = Col([head, kpis, Grid([weekly, byRegion], 2, 280, 4), top])
$region = "全部"
orders = Query("get_orders", {days: 90}, {rows: []})
rows = $region == "全部" ? orders.rows : @Filter(orders.rows, "region", "==", $region)
head = Row([Title("最近 90 天销售情况", "lg"), Spacer(), SegmentedControl($region, ["全部", "北部", "南部", "东部", "西部"])], 3, null, null, true)
kpis = Grid([Card([Caption("销售额"), Title(@Format(@Sum(rows.amount), "compact", 1, "USD"), "xl")]), Card([Caption("订单数"), Title(@Format(@Count(rows)), "xl")])], 2, 160, 3)
weekly = Card([Title("每周销售额", "sm"), Chart("line", @Bucket(rows, "date", "week", "amount"), "key", ["value"], "currency")])
byRegion = Card([Title("各地区销售额", "sm"), Chart("donut", @GroupBy(orders.rows, "region", "amount"), "key", ["value"], "currency")])
top = Table(["商品", "销售额"], @Each(@Top(@GroupBy(rows, "product", "amount"), "value", 5), "p", [p.key, @Format(p.value, "currency")]))`;

const rules = [
  "除非用户明确指定其他语言，本轮及后续生成的所有面向用户的文案默认使用简体中文，包括标题、正文、按钮、表单标签与占位文字、选项、图表和表格标签、图示文字、替代文本、无障碍名称，以及通过 @ToAssistant 发送的消息。组件名、函数名、动作名、工具名、属性名、枚举值、变量名、协议字段、URL、代码和 OpenUI Lang 语法保持原样；人名、地名、专有名词及用户要求保留的原文按语境处理。SearchImage 的查询词可使用英文或当地常用名称以提高图片搜索命中率，但页面上显示给用户的内容仍使用简体中文。",
  "日期与时间优先采用中文常用格式，金额、单位和数量应清晰标注；避免在面向用户的文案中使用不必要的英文缩写。",
  "Compose the answer like a page, not a form letter: a Title, a short Text, then a mix of blocks that show the content. SearchImage for every place, dish, product or thing that has a look (the app finds the photo, so never say you cannot show photos); Row, Grid and Carousel to set things side by side; Badge rows for quick facts; Card only to group a block; Popover for an aside.",
  "Spacing is a system with three tiers that always nest: inner (gap 1-2, 4-8px) for a title with its subtitle, tags or line; group (gap 3-4, 12-16px) between blocks inside a Card or grid cell; section (24px) between the blocks of the page. Leave gap unset on the page's root Col and on card contents: the app applies these tiers. Set a gap only on a Row or Grid. Never use one gap for everything, and never a gap larger than the section gap.",
  "A photo beside text is a media row: Row([Box([SearchImage(query, 1.33)]), Col([Title(..., \"md\"), Row([Badge(...), Badge(...)], 1, null, null, true), Text(..., \"sm\")], 2)], 4, \"start\"). The app sizes the photo to a third of the row (at most 200px) and top-aligns the text. Facts are Badges, never Buttons or boxed pills.",
  "Every SearchImage query names the exact subject the user will recognise (\"flat-pack bookshelf assembly\", \"Sonoma Plaza\"), never a generic scene. If no photo would show the subject, use no image.",
  "Keep cards compact and scannable: Title \"md\" (never lg or xl inside a Card), Text \"sm\" for the body, at most one short paragraph, then facts as Badges or label/value rows (Caption label, Spacer, Text value). Don't write bold-lead paragraphs like \"**Weekend rhythm:** ...\" or long prose in a card. Cards side by side in a Grid share the same blocks in the same order and the same SearchImage aspect ratio, so they line up. For example: c = Card([SearchImage(\"Sonoma Plaza\", 1.5), Col([Title(\"索诺玛\", \"md\"), Row([Badge(\"车程 1 小时\", null, \"car\"), Badge(\"葡萄酒产区\", \"purple\")], 1, null, null, true)], 2), Text(\"悠闲的广场、品酒室与安静的乡间道路。\", \"sm\"), Col([Row([Caption(\"适合：\"), Spacer(), Text(\"美食与葡萄酒\", \"sm\")]), Row([Caption(\"需要考虑：\"), Spacer(), Text(\"品酒费用会增加\", \"sm\")])], 1)])",
  "Answer with a working tool whenever the request involves numbers, choices, lists, steps, a game or something to explore: keep inputs and lists in $variables, compute everything shown from them with expressions and @functions, and change them with @Set. The page must work on its own, without another message.",
  "Use @ToAssistant only for what the page cannot compute: a Form's submit Button, or a new request (\"请帮我规划另一天的行程\"). Its message is short and first person, like the user typing it (\"Help me choose a bike\"); the form values travel with it, so never repeat them in the message.",
  "$variable defaults are literals (numbers, strings, lists, objects), never expressions or @calls. Edit lists with @Append, @Remove, @RemoveAt and @Update; track selections with @Toggle and @Includes.",
  "cond ? a : b also picks between components; there is no @If. Use only the listed @functions; you cannot define your own.",
  "Derive rows once in a statement with @Each(list, \"x\", {...}), then reuse them in @Each, Table, Chart, @Sum(rows.field) and @Join. @Each(@Range(0, n), \"i\", ...) builds a series or repeats a step.",
  "@Random, @Pick and @Shuffle give a new value on every evaluation: call them inside @Set, so a click draws once and the page stays still.",
  "Pick the medium that shows the idea: Chart for numbers across time or categories; Svg drawings for shapes, parts and movement; Map with MapMarker for places and routes; Table for comparisons; Flashcard and Celebration for learning and games; HtmlView only for a game or animation that needs a loop.",
  "Draw with Svg whenever the user would otherwise have to picture it: assembly and how-to steps (a simple drawing for each step, like an instruction leaflet), knots and folds, how a machine, mechanism or the body works, geometry and science diagrams, the layout of a room, garden or board, chord and clock faces. A photo shows what a thing looks like; a drawing shows how it goes together or works, so a how-to or how-it-works answer has drawings even when it also has a photo. Keep each drawing simple: a viewBox about 240 wide, a dozen or so shapes in the listed colors with SvgText labels, a Line with a small Polygon head for an arrow, and let $variables such as the current step drive it.",
  "Format money, percentages and big numbers with @Format, counts with @Plural and dates with @FormatDate.",
  "Dates relative to now (today, this week, next month) start from @Today(), never a fixed date. <, >, <= and >= compare numbers only, so order two dates with @DaysBetween(a, b) > 0.",
  "To change a page from an earlier answer, keep its $variable names and start them from that answer's \"context and form values\", so what the user typed, added or ticked carries over.",
  "Read a number input for a count or amount through @Default and @Clamp with a sensible minimum, e.g. @Clamp(@Default($people, 1), 1, 50), so 0, empty or negative cannot divide by zero or zero out the page.",
  "Answer a plain knowledge or safety question with Markdown text, adding a SearchImage or a Quote only where it helps.",
];

/** 聊天提示词：不包含工具，启用 $variables 和函数。 */
export const promptOptions: PromptOptions = {
  bindings: true,
  additionalRules: rules,
  examples: [
    `示例 1：调整用餐人数后会自动缩放用量的购物清单，包含勾选清单和复制按钮：\n\n${exampleShoppingList}`,
    `示例 2：组合式旅行答案，包含照片、要点、每日行程和简短表单：\n\n${exampleTrip}`,
    `示例 3：由 $step 驱动、每一步都配有示意图的操作指南：\n\n${exampleSteps}`,
  ],
};

/** 用演示数据工具生成仪表盘：通过 Query 获取数据行，并用数据函数整理。 */
export const dashboardPromptOptions: PromptOptions = {
  ...promptOptions,
  tools: demoToolSpecs,
  toolExamples: [`示例 4：基于 Query 数据行动态生成的仪表盘：\n\n${exampleDashboard}`],
  additionalRules: [
    ...rules,
    "Fetch rows with Query and compute every number, group and series from them with @Sum, @Count, @GroupBy, @Bucket, @Top, @Stats and @Change. A filter is a $variable (from this library's Select or SegmentedControl) applied with @Filter; select dates and ranges with @Between, since @Filter's < and > compare numbers only.",
  ],
};
