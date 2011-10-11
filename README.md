第二个动画游戏。

# 贪吃蛇

## 起源

* [http://zh.wikipedia.org/wiki/贪食蛇](http://zh.wikipedia.org/wiki/%E8%B4%AA%E9%A3%9F%E8%9B%87)
* [http://en.wikipedia.org/wiki/Snake_(video_game)](http://en.wikipedia.org/wiki/Snake_(video_game))

## 所得
	
* 增加辅助类：颜色
* 增加辅助类：向量

### 帧率和速度定义

我猜，有三种选择：

1. 舞台降低帧率，蛇行进速度为网格单位长度 。
2. 舞台正常帧率，蛇行进速度为网格单位长度，但蛇更新状态时使用较低的局部帧率。
3. 帧率全部不变，使用无数个 Deferred/Promise， 此异步任务确保蛇行进了单位长度才能改向。

很明显，按描述字数长度就可知，选择一实现最简单，选择三最复杂。
选择二和三适用于其他游戏中内嵌一个贪吃蛇游戏。

### 如何移动

这个游戏选择第一种做法。然后移动规则的实现就很明了——蛇所有部位的位置信息为保存为一个向量列表，每个移动时，pop 末尾，头部加上移动向量 unshift 进位置列表，这就完成一次移动 。

## 使用

```
// 显示调试用网格
// SnakeGame.debug = true;

// 设定穿墙
// SnakeGame.penetrable = false;

// canvas,宽，高，缩放
SnakeGame.init('#snake-game',720,480,1);
// SnakeGame.init('#snake-game',480,320,2);
```