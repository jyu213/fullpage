## Fullpage.js

这个有点写的四不象。本意是打算写一个全屏滚动插件的，后来发现所有关于滚动的在本质上都有点相近，稍微变动一下差不多就能满足了，只不过很多都没有相关参数可以配置。anyway,这个插件能够解决问题，但是，我也没感觉该有的超能力。比如？比如特别短小，性能很佳，专注移动端，超强的适应能力？扯远了，先来看看它带来的功能吧。

### 前奏

### 用法
页面引用 fullpage.js， 依赖 jquery。 页面加载完成后调用 fullpage 方法。 （建议 css 部分自己另外处理，感觉这样比较灵活）

HTTML: 

        <div id="fullpage">
            <div class="section ">
                <h1>圈圈1</h1>
            </div>
            <div class="section">
                <h1>圈圈2</h1>
            </div>
            <div class="section">
                <h1>圈圈3</h1>
            </div>
            <div class="section">
                <h1>圈圈4</h1>
            </div>
        </div>

JS: 

    <script src="fullpage.js"></script>
    $('#fullpage').fullpage({
        pager: '.fp-pager'
    });


### 参数说明
    
    activeSectionClass: 'active',  // active section class
    activePagerClass: 'cur',  // active page class
    after: null,  // 动画执行后回调函数: function(currentSection, nextSection, sectionIndex)
    autoScrolling: true,  // 是否启用滚动
    before: null,  // 动画执行前回调函数: function(currentSection, nextSection, sectionIndex)
    css3: true,  // 是否启用css3 动画 , 默认启用，如无，则使用 jquery animate
    css3Easing: 'ease-out',  // css 动画方式
    direction: 'vertical',  // 滚动方向，依赖 css。 只提供 vertical || horizontal
    easing: 'swing',  // jquery animate 滚动方式。若启用 css3， 高级浏览器中将忽略此选项
    fixTop: 0,  // 修正 top 值
    loop: false,  // 是否循环滚动
    // resize: false,
    sectionSelector: '.section',  // 层元素选择器
    setDelay: 600,  // 动画间隔
    setHash: false,  // 是否使用 location hash， 注，未对原先已使用 hash 做兼容
    setKeyboard: true,  // 是否支持键盘事件
    setMouseWheel: true,  // 是否支持鼠标滚动
    setSpeed: 700,  // 滚动速度
    setTimeout: 0, // 设置自动滚动时间间隔。 0 则为关闭
    setTouch: true,  // 是否支持手势
    startSection: 0,  // 起始位置
    pager: null,  //  导航元素选择器
    pagerAnchorBuilder: null,  // callback fn for building anchor links : function(index, DOMelement)
    pagerEvent: 'click',  // 导航事件
    prev: null,  // 翻页元素选择器; css 自定义
    next: null  // 翻页元素选择器; css 自定义

提供事件函数

    moveTo: function(){} // 滚动到某元素位置。参数为 位置值

### DEMO 演示
* [全屏滚动](examples/demo1.html)
* [测试](examples/test.html)