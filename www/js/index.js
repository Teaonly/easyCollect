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
    west__maxSize: 0.40
  });

  g.service.getIndex();
});

var g = {};
g.data = {};
g.service = {};
g.gui = {};
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

    for(var i = 0; i < indexObj.sources.length; i++) {
      g.data.sources.push(indexObj.sources[i].value);
      treeData[0].children.push({
          label:  indexObj.sources[i].display
        , type:   'source'
        , value:  indexObj.sources[i].value
      });
    }

    for(var i = 0; i < indexObj.tags.length; i++) {
      g.data.tags.push({'value':indexObj.tags[i].value, 'number':indexObj.tags[i].number});

      treeData[1].children.push({
          label:  indexObj.tags[i].value + ":" + indexObj.tags[i].number
        , value:  indexObj.tags[i].value
        , number: indexObj.tags[i].number
      });
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
  var address = null;
  if ( node.type === "source") {
    var select = node.value;
    address = "/_/getDataBySource";
    if ( select !== "all" && select !== undefined) {
      address = "/_/getDataBySource?source=" + select;
    }
  }

  if ( address !== null) {
    // 显示等待窗口
    $( "#waitDialog" ).dialog({
      dialogClass: "no-close",
      modal: true
    });

    $.getJSON( address, function( dataObj ) {
      g.data.collects = {};
      var html = "";
      for(var i = 0; i < dataObj.length; i++) {
        // B端保存数据
        g.data.collects[ dataObj[i].index ] = dataObj[i].tags;

        if ( dataObj[i].source == 'weibo') {
          html += g.weibo.buildListItem( dataObj[i]);
        }
      }
      $("#listItems").html(html);

      // 配置相关GUI事件
      $(".btnDeleteCollect").bind('click',function(){
        var index = $(this).attr('index');
        g.service.removeCollect( index );
      });
      $(".btnAddTag").bind('click', function(){
        var index = $(this).attr('index');
        g.gui.addTag(index);
      });
      $("#waitDialog").dialog( "close" );
    });
  }
};

g.service.removeCollect = function(index){
  // TODO
  $("#item_" + index).remove();
}

g.service.removeTag = function(index, tag) {

}

g.service.addTag = function(index, newTags) {

}

g.gui.addTag = function (index) {
  var dialog = $("#addTagDialog").dialog({
    modal: true,
    buttons: {
      "设置标签": function() {
        var newTags = $("#inputNewTag").val().split(',');
        console.log(newTags);
        if(newTags.length > 0 && newTags[0] !== "") {
          g.service.addTag(newTags);
          $('#inputNewTag').tagEditor('destroy');
          form = dialog.find( "form" )[0].reset();
          dialog.dialog( "close" );
        }
      },
      '取消': function() {
        $('#inputNewTag').tagEditor('destroy');
        form = dialog.find( "form" )[0].reset();
        dialog.dialog( "close" );
      }
    }
  });

  $('#inputNewTag').tagEditor({
    autocomplete: {
        delay: 0, // show suggestions immediately
        position: { collision: 'flip' }, // automatic menu position up/down
        source: ['计算机视觉', '机器学习', 'Asp', 'Python', 'Ruby']
    }
  });
}
