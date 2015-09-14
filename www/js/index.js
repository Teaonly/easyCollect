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

  g.service.getIndex();
});

var g = {};
g.data = {};
g.service = {};
g.service.getIndex = function() {
  $.getJSON( "/_/getIndex", function( indexObj ) {
    var treeData = [
        {label:'数据来源'},
        {label:'标签'},
    ];
    treeData[0].children = [];
    treeData[0].children.push({label:'全部来源', type:'source', vlaue:'all'});
    treeData[1].children = [];
    treeData[1].children.push({label:'未设置', type:'tag', vlaue:''});

    g.data.sources = [];
    g.data.tags = [];
    for(var i = 0; i < indexObj.length; i++) {
      if ( indexObj[i].type === "source" ) {
        g.data.sources.push(indexObj[i].value);
        treeData[0].children.push({
            label:  indexObj[i].display
          , type:   indexObj[i].type
          , value:  indexObj[i].value
        });
      } else if ( indexObj[i].type === "tag") {
        g.data.tags.push(indexObj[i].value);
        treeData[1].children.push({
            label:  indexObj[i].value
          , type:   indexObj[i].type
          , value:  indexObj[i].value
        });
      }
    }
    $("#tagsTree").tree({
        data: treeData,
        autoOpen: true,
        dragAndDrop: false,
        keyboardSupport: false,
        onCanSelectNode: function(node) {
          g.service.getData(node);
        }
    });
  }).fail(function() {
    alert("获取Index数据错误！");
  })
};

g.service.getData = function(node) {
  if ( node.type === "source") {
    var select = node.value;
    var address = "/_/getDataBySource";
    if ( select !== "all" && select !== undefined) {
      address = "/_/getDataBySource?source=" + select;
    }

    $( "#waitDialog" ).dialog({
      dialogClass: "no-close",
      modal: true
    });
    
    $.getJSON( address, function( indexObj ) {
      console.log(indexObj);
    });
  }
};
