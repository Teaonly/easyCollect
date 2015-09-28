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
    west__size:    0.20,
    west__minSize: 0.15,
    west__maxSize: 0.40
  });

  $("#btnAddURL").bind('click', g.gui.addURL);

  g.service.getIndex();
});

var g = {};
g.data = {};
g.service = {};
g.gui = {};
g.service.getIndex = function() {
  $.getJSON( "/_/getIndex", function( indexObj ) {
    g.data.sources = indexObj.sources;

    g.data.tags = {};
    for (var t in indexObj.tags) {
      g.data.tags[t] = parseInt(indexObj.tags[t]);
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
  } else if (node.type === "tag") {
    var select = node.value;
    address = "/_/getDataByTag";
    if ( select !== null && select !== undefined) {
      address = "/_/getDataByTag?tag=" + select;
    }
  } else if (node.type === 'star') {
    address = "/_/getDataByStar";
  } else if (node.type === 'tags') {
    var tagsString = jQuery.param({tags:node.value});
    address = "/_/getDataByTags?and=" + (node.and === true) + "&" + tagsString;
  } else if (node.type === 'select_tags') {
      g.gui.selectTags(function(tags, and){
        var node = {};
        node.type = 'tags';
        node.value = tags;
        node.and = and;
        g.service.getData(node);
      });
      return;
  } else {
    return;
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
        html += g.post.build( dataObj[i]);
      }
      $("#listItems").html(html);

      // 配置相关GUI事件处理
      $(".btnDeleteCollect").bind('click',function(){
        var index = $(this).attr('index');
        g.service.removeCollect( index );
        $("#item_" + index).remove();
      });
      $(".linkText").linkify();
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
  var address = '/_/removeCollect?index=' + index;
  $.getJSON( address, function( dataObj ) {

  });

  var needUpdate = false;
  var removedTags = g.data.collects[index];
  for(var j = 0; removedTags !== undefined && j < removedTags.length; j++) {
    g.data.tags[removedTags[j]] --;
    if ( g.data.tags[removedTags[j]] === 0) {
      delete g.data.tags[removedTags[j]];
      needUpdate = true;
    }
  }
  if ( needUpdate) {
    g.gui.updateTagTree();
  }
}

g.service.removeTag = function(index, tag) {
  var tagsString = jQuery.param({tags:g.data.collects[index]});
  var address = '/_/updateTag?index=' + index;
  if ( tagsString !== "") {
    address = address + '&' + tagsString;
  }
  $.getJSON( address, function( dataObj ) {

  });

  if ( g.data.tags.hasOwnProperty(tag)) {
    g.data.tags[tag] --;
    if ( g.data.tags[tag] === 0) {
      delete g.data.tags[tag];
    }
  }

  g.gui.updateTagTree();
};

g.service.addTag = function(index, newTags) {
  var tagsString = jQuery.param({tags:g.data.collects[index]});
  var address = '/_/updateTag?index=' + index;
  if ( tagsString !== "") {
    address = address + '&' + tagsString;
  }
  $.getJSON( address, function( dataObj ) {

  });


  for(var j = 0; j < newTags.length; j++) {
    if ( g.data.tags.hasOwnProperty(newTags[j]) ) {
       g.data.tags[newTags[j]] ++;
    } else {
       g.data.tags[newTags[j]] = 1;
    }
  }
  g.gui.updateTagTree();
};

g.service.addURL = function(url, memo) {
  var param = {
    'source': 'url',
    'url' : url,
    'memo': memo
  };
  var address = '/_/insertCollect?' + $.param(param);
  $.getJSON( address, function( dataObj ) {
  });
};

g.service.doStar = function(index, isStar) {
  var starString = jQuery.param({star:isStar});
  var address = '/_/updateStar?index=' + index;
  address = address + '&' + starString;
  $.getJSON( address, function( dataObj ) {
  });
};

g.service.accessWeibo = function(index) {
  if ( index === undefined) {
    return;
  }
  var address = '/_/getAddressOfWeibo?index=' + index;
  $.getJSON( address, function( dataObj ) {
    if ( dataObj.url != undefined) {
      var win = window.open(dataObj.url, '_blank');
    }
  });
};

g.gui.updateTagTree = function() {
  var treeData = [
      {label:'数据来源'},
      {label:'标签'},
  ];

  treeData[0].children = [];
  treeData[0].children.push({label:'全部来源', type:'source', vlaue:'all'});
  for(var i in g.data.sources) {
    treeData[0].children.push({
        label:  g.data.sources[i]
      , type:   'source'
      , value:  i
    });
  }

  treeData[1].children = [];
  var myTags = [];
  var subTree = {};
  for (var t in g.data.tags) {
    myTags.push(t);
    var splitPos = t.indexOf('-');
    if ( splitPos > 0 && splitPos < t.length - 1) {
      var cat = t.substring(0, splitPos);
      if ( subTree[cat] === undefined) {
        subTree[cat] = [];
        treeData[1].children.push({
            label:  cat
          , children: subTree[cat]
        });
      }
    }
  }
  myTags.sort();
  treeData[1].children.sort( function(a,b) {
    if ( a.label > b.label) {
      return 1;
    } if ( a.label === b.label) {
      return 0;
    } else {
      return -1;
    }
  });

  treeData[1].children.unshift({label:'#星标#', type:'star'});
  treeData[1].children.unshift({label:'#多标签选择#', type:'select_tags', vlaue:[]});
  treeData[1].children.unshift({label:'#未设置标签#', type:'tag', vlaue:null});

  for(var i =0; i < myTags.length; i++) {
    var t = myTags[i];
    var splitPos = t.indexOf('-');
    if ( splitPos > 0 && splitPos < t.length - 1) {
      var cat = t.substring(0, splitPos);
      subTree[cat].push({
        label:  t + "（" + g.data.tags[t] + "）"
        , type:   'tag'
        , value:  t
      });
    } else {
      treeData[1].children.push({
          label:  t + "（" + g.data.tags[t] + "）"
        , type:   'tag'
        , value:  t
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
  // 星标
  $(".btnStar").bind('click', function() {
     var index = $(this).parent().attr('index');
     var iSelector = $(this).find('i:first');
     if (iSelector.hasClass('stared')) {
       iSelector.removeClass('glyphicon-star');
       iSelector.addClass('glyphicon-star-empty');
       iSelector.removeClass('stared');

       g.service.doStar(index, false);
     } else {
       iSelector.removeClass('glyphicon-star-empty');
       iSelector.addClass('glyphicon-star');
       iSelector.addClass('stared');

       g.service.doStar(index, true);
     }

  });
  // 移除标签
  $(".btnRemoveTag").bind('click', function(){
    var index = $(this).parent().attr('index');
    var tagValue = $(this).attr('tagValue');
    $(this).remove();

    var oldTags = g.data.collects[index];
    var newTags = [];
    for(var i =0; oldTags !== undefined && i < oldTags.length; i++) {
      if ( oldTags[i] != tagValue ) {
        newTags.push( oldTags[i]);
      }
    }
    g.data.collects[index] = newTags;

    g.service.removeTag(index, tagValue);
  });
};

g.gui.addURL = function() {
  var dialog = $("#addURLDialog").dialog({
      modal: true,
      width: 480,
      buttons: {
        "确定": function() {
          var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
          var url = $("#inputURL").val();
          var memo = $("#textURLMemo").val();
          if (regexp.test(url) && memo != "" && memo.length <= 144) {
            g.service.addURL(url, memo);
            dialog.find( "form" )[0].reset();
            dialog.dialog( "close" );
          } else {
            alert("请输入正确的信息，注释不能超过144个字。");
          }
        },
        "取消": function(){
          dialog.find( "form" )[0].reset();
          dialog.dialog( "close" );
        }
      }
  });
};

g.gui.addTag = function(tagDiv, index) {

  var dialog = $("#addTagDialog").dialog({
    modal: true,
    width: 640,
    height: 480,
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

  for(var i in g.data.tags) {
    var isNewTag = true;
    for(var j = 0; tagSelected != undefined && j < tagSelected.length; j++) {
      if ( i === tagSelected[j]) {
        isNewTag = false;
        break;
      }
    }
    if ( isNewTag ) {
      tagSources.push(i);
    }
  }

  tagSources.sort();

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

g.gui.selectTags = function(cb) {
  // 按标签多选
  var dialog = $("#addTagDialog").dialog({
    title: '多标签选择',
    modal: true,
    width: 640,
    height: 480,
    buttons: {
      "确定（and）": function() {
        var selectedTags = $("#inputNewTag").val().split(',');
        if ( selectedTags.length > 0) {
          cb(selectedTags, true);
        }
        dialog.find( "form" )[0].reset();
        dialog.dialog( "close" );
      },
      "确定（or）": function() {
        var selectedTags = $("#inputNewTag").val().split(',');
        if ( selectedTags.length > 0) {
          cb(selectedTags, false);
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
  for(var i in g.data.tags) {
    tagSources.push(i);
  }
  tagSources.sort();

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
