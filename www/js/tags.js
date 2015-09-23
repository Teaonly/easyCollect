(function(exports) {

  var tagWidget = {}

  tagWidget.build = function(index, tags) {
    var html = '<div index="'+ index +'">';
    html += '<button type="button" class="btn btn-link btn-xs btnAddTag">增加标签</button>'

    html += '<button type="button" class="btn btn-danger btn-xs btn inactive"><span class="glyphicon glyphicon-star" aria-hidden="true"></button>'


    for(var i = 0; tags !== undefined && i < tags.length; i++) {
      html += '<button type="button" class="btn btn-info btn-xs  btnRemoveTag" tagValue="'+ tags[i] +'">' + tags[i] + '<span class="glyphicon glyphicon-remove-circle"></span></button>'
    }



    html += "</div>";
    return html;
  };

  tagWidget.addTag = function( tagDiv, newTags ) {
    for (var i = 0; i < newTags.length; i++) {
      var html = '<button type="button" class="btn btn-info btn-xs  btnRemoveTag" tagValue="'+ newTags[i] +'">' + newTags[i] + '<span class="glyphicon glyphicon-remove-circle"></span></button>'
      tagDiv.append( html );
    }
  };

  exports['tagWidget'] = tagWidget;

})((typeof module != 'undefined' && module.exports) || g )
