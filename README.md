# FrameBridge JS

Minimal frame bridge, using `window.postMessage`.

To communicate between two frames you simply instantiate an instance of `FrameBridge` in both parent and child.

Take for example the following parent page:

```html
<iframe id="child-page" width="100%" height="500"></iframe>

<script>
var frame = document.getElementById('child-page');
var bridge = new FrameBridge({target: frame});

bridge.on('setFrameHeight', function(height){
  frame.height = height;
});
</script>
```

With a child page like this:

```html
<div class="container">....</div>

<script>
var bridge = new FrameBridge();
window.onload = function(){
  bridge.trigger('setFrameHeight', document.body.clientHeight);
};
</script>
```

This would resize the frame in the parent window to match the actual size of the content.
