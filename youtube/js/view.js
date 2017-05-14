//  View module is just a place where I store all the HTML components, wrapped by JS, i.e. JS components + some methods, related to gesture recognizing (taken from the internet) 
// and sliding animation (not taken from the internet)

function addItem (item) {
        var snippet = item.snippet;
        return `
                    <div class="video">
                    <img class="preview" src="`+snippet.thumbnails.high.url+`">
                    <a href="`+'https://www.youtube.com/watch?v='+item.id.videoId+`" class="headline">`+snippet.title+`</a>
                    <div class="info">
                        <i class="fa fa-user" aria-hidden="true"></i>
                        <span>`+snippet.channelTitle+`</span>
                    </div>
                    <div class="info">
                        <i class="fa fa-calendar" aria-hidden="true"></i>
                        <span>`+formatDate(new Date(snippet.publishedAt))+`</span>
                    </div>
                    <div class="info">
                        <i class="fa fa-eye" aria-hidden="true"></i>
                        <span>`+item.statistics.viewCount+`</span>
                    </div>
                    <p>`+snippet.description+`</p>
                </div>`;
                
}

function addArrowLeft() {
    return `
            <a href="#" onclick="pagePrev()"> 
          <i class="fa fa-chevron-left fa-inverse" aria-hidden="true"></i>
        </a>
    `
}

function addPage(pages, selected) {
    return `
           <a `+(selected ? `class="selected"` : ``)+`href="#" onClick="pageHandler(this)">
          ` +pages+`
        </a> 
    `
}

function addArrowRight() {
    return `
            <a href="#" onclick="pageNext()">
          <i class="fa fa-chevron-right fa-inverse" aria-hidden="true"></i>
        </a> 
    `
}

function slide(direction, action) {
    var container = document.getElementById('search-container')
    if(direction === 'rtl') {
        container.style.transform = "translate(-100%)"
    }
    else {
        container.style.transform = "translate(100%)"
    }
    container.style.transition = "300ms"

    setTimeout(function(){
        action()
        if(direction === 'rtl') {
            container.style.transform = "translate(100%)"
        }
        else {
            container.style.transform = "translate(-100%)"
        }
        container.style.transition = "0ms"
        setTimeout(function(){
            container.style.transform = "translate(0%)"
            container.style.transition = "300ms"
        },10)
    }, 300) 
}

function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

//  swipe detection from http://stackoverflow.com/questions/15084675/how-to-implement-swipe-gestures-for-mobile-devices
function detectswipe(el,func) {
  swipe_det = new Object();
  swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  var min_x = 30;  //min x swipe for horizontal swipe
  var max_x = 30;  //max x difference for vertical swipe
  var min_y = 50;  //min y swipe for vertical swipe
  var max_y = 60;  //max y difference for horizontal swipe
  var direc = "";
  ele = document.getElementById(el);
  ele.addEventListener('touchstart',function(e){
    var t = e.touches[0];
    swipe_det.sX = t.screenX; 
    swipe_det.sY = t.screenY;
  },false);
  ele.addEventListener('touchmove',function(e){
    e.preventDefault();
    var t = e.touches[0];
    swipe_det.eX = t.screenX; 
    swipe_det.eY = t.screenY;    
  },false);
  ele.addEventListener('touchend',function(e){
    //horizontal detection
    if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
      if(swipe_det.eX > swipe_det.sX) direc = "r";
      else direc = "l";
    }
    //vertical detection
    else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
      if(swipe_det.eY > swipe_det.sY) direc = "d";
      else direc = "u";
    }

    if (direc != "") {
      if(typeof func == 'function') func(el,direc);
    }
    direc = "";
    swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  },false);  
}