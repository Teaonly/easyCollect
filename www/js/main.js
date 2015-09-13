// like main function in C
$(document).ready(function () {
  // UI 初始化
  var zeroMargin = {
      top:	0
    ,	bottom:	0
    ,	left:	0
    ,	right:	0
  };
  $('body').layout({
    inset:        zeroMargin,
    closable:      false,
    west__minSize: 0.15,
    west__maxSize: 0.40,
    center__childOptions:	{
        closable:      false,
        inset:        zeroMargin,
        north__minSize:  0.30,
        north__maxSize:  0.70
    }
  });

  // 事件绑定
  $("#btn_import_weibo").button().click(g.evt.onImportWeibo);

});

var g = {};

g.evt = {};
g.evt.onImportWeibo = function(evt) {
  evt.preventDefault(false);
  $.getJSON( "/_/import?source=weibo", function( data ) {
    if ( data.address != undefined ) {
      window.location.href = data.address;
    } else {
      alert("获取微博数据错误！");
    }
  }).fail(function() {
    alert("获取微博数据错误！");
  })
};
