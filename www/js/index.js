'use strict';

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
    g.data.sources = [];
    g.data.tags = [];

    for(var i = 0; i < indexObj.sources.length; i++) {
      g.data.sources.push({'value': indexObj.sources[i].value, 'display':indexObj.sources[i].display });
    }

    for(var i = 0; i < indexObj.tags.length; i++) {
      g.data.tags.push({'value':indexObj.tags[i].value, 'number':parseInt(indexObj.tags[i].number)});
    }

    g.gui.updateTagTree();

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
  } else {
    // 其他方式
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

      // 配置相关GUI事件处理
      $(".btnDeleteCollect").bind('click',function(){
        var index = $(this).attr('index');
        g.service.removeCollect( index );
        $("#item_" + index).remove();
      });
      $(".btnAccessOrignalWeibo").bind('click', function(){
        var index = $(this).attr('index');
        if(index !== undefined) {
          g.service.accessWeibo(index);
        }
      });
      g.gui.refreshTagEvent();

      $("#waitDialog").dialog( "close" );
    });
  }
};

g.service.removeCollect = function(index){
  // TODO call JSON

  var needUpdate = false;
  var removedTags = g.data.collects[index];
  for(var j = 0; removedTags !== undefined && j < removedTags.length; j++) {
    for(var i = 0; i < g.data.tags.length; i++) {
      if (g.data.tags[i].value === removedTags[j]) {
        g.data.tags[i].number --;
        needUpdate = true;
        break;
      }
    }
  }
  if ( needUpdate) {
    g.gui.updateTagTree();
  }
}

g.service.removeTag = function(index, tag) {
  // TODO call JSON

  for(var i = 0; i < g.data.tags.length; i++) {
    if (g.data.tags[i].value === tag) {
      g.data.tags[i].number --;
      break;
    }
  }
  g.gui.updateTagTree();
};

g.service.addTag = function(index, newTags) {
  // TODO call JSON

  for(var j = 0; j < newTags.length; j++) {
    var isNewTag = true;

    for(var i = 0; i < g.data.tags.length; i++) {
      if (g.data.tags[i].value === newTags[j]) {
        g.data.tags[i].number ++;
        isNewTag = false;
        break;
      }
    }

    if (isNewTag === true) {
      g.data.tags.push({value: newTags[j], number:1});
    }
  }
  g.gui.updateTagTree();
};

g.service.accessWeibo = function(index) {

};

g.gui.updateTagTree = function() {
  var treeData = [
      {label:'数据来源'},
      {label:'标签'},
  ];
  treeData[0].children = [];
  treeData[0].children.push({label:'全部来源', type:'source', vlaue:'all'});
  treeData[1].children = [];

  for(var i = 0; i < g.data.sources.length; i++) {
    treeData[0].children.push({
        label:  g.data.sources[i].display
      , type:   'source'
      , value:  g.data.sources[i].value
    });
  }

  for(var i = 0; i < g.data.tags.length; i++) {
    if ( g.data.tags[i].number > 0) {
      treeData[1].children.push({
          label:  g.data.tags[i].value + "（" + g.data.tags[i].number + "）"
        , value:  g.data.tags[i].value
        , number: g.data.tags[i].number
      });
    }
  }
  $("#tagsTree").tree('destroy');
  $("#tagsTree").tree({
      data: treeData,
      autoOpen: true,
      dragAndDrop: false,
      keyboardSupport: false,
      onCanSelectNode: function(node) {
        g.service.getData(node);
      }
  });
};

g.gui.refreshTagEvent = function() {
  // 增加标签
  $(".btnAddTag").bind('click', function(){
    var index = $(this).parent().attr('index');
    g.gui.addTag($(this).parent(), index);
  });
  // 移除标签
  $(".btnRemoveTag").bind('click', function(){
    var index = $(this).parent().attr('index');
    var tagValue = $(this).attr('tagValue');
    $(this).remove();

    g.service.removeTag(index, tagValue);
  });
};

g.gui.addTag = function(tagDiv, index) {

  var dialog = $("#addTagDialog").dialog({
    modal: true,
    width: 480,
    height: 360,
    buttons: {
      "确定": function() {
        var newTags = $("#inputNewTag").val().split(',');
        if(newTags.length > 0 && newTags[0] !== "") {
          // 去掉已经存在的重复tag
          var realNewTags = [];
          var oldTags = g.data.collects[index];
          for(var i = 0; i < newTags.length; i++) {
            var exist = false;
            for(var j = 0;  oldTags !== undefined && j < oldTags.length; j++) {
              if ( newTags[i] === oldTags[j]) {
                exist = true;
                break;
              }
            }
            if ( exist === false ) {
              realNewTags.push( newTags[i] );
            }
          }
          newTags = realNewTags;

          if ( newTags.length > 0) {
            g.data.collects[index] = newTags.concat( oldTags );

            g.tagWidget.addTag(tagDiv, newTags);
            g.gui.refreshTagEvent();
            g.service.addTag(index, newTags);
          }
        }
        dialog.find( "form" )[0].reset();
        dialog.dialog( "close" );
      },
      '取消': function() {
        dialog.find( "form" )[0].reset();
        dialog.dialog( "close" );
      }
    }
  });

  var tagSources = [];
  var tagSelected = g.data.collects[index];

  for(var i = 0; i < g.data.tags.length; i++) {
    var isNewTag = true;
    for(var j = 0; tagSelected != undefined && j < tagSelected.length; j++) {
      if ( g.data.tags[i].value === tagSelected[j]) {
        isNewTag = false;
        break;
      }
    }
    if ( isNewTag ) {
      tagSources.push( g.data.tags[i].value  )
    }
  }

  $('#inputNewTag').tagEditor('destroy');
  $('#inputNewTag').tagEditor({
    removeDuplicates: true,
    autocomplete: {
        delay: 0, // show suggestions immediately
        position: { collision: 'flip' }, // automatic menu position up/down
        source: tagSources
    }
  });

  var html = "";
  for( var i = 0; i < tagSources.length; i++) {
    html += '<span class="spanSelectTag"> <button type="button" class="btn btn-default btn-xs btnSelectTag" tagValue="' + tagSources[i] + '">' +  tagSources[i]  + '</button></span>';
  }
  $("#unselectedTags").html(html);
  $(".btnSelectTag").bind('click',function(){
    $('#inputNewTag').tagEditor('addTag', $(this).attr('tagValue'));
  });

}
