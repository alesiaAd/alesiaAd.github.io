//  Model 

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

class YouHelper {
    constructor(queryString, maxReultsCount) {
        this.urlString = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyAWK6U5UuH8UPWlj1iLUQ4aI7ioL275PmI&type=video&part=snippet&maxResults=' + maxReultsCount + '&q=' + queryString;
        this.nextPageToken = null;
        this.newItemsReceived = null;
        this.total = null;
        this.lastSearchString = null;
    }

    next() {
        var self = this;
        var client = new HttpClient();
        var url = this.urlString;
        if(this.nextPageToken != null) {
            url = url + "&pageToken=" + this.nextPageToken
        }
        client.get(url, function(response) {
            var responseObject = JSON.parse(response)
            self.total = responseObject.pageInfo.totalResults;
            self.nextPageToken = responseObject.nextPageToken
            var videoIds = ''
            for(var i = 0; i < responseObject.items.length; ++i) {
                var item = responseObject.items[i]
                if(i == responseObject.items.length - 1) {
                    videoIds += item.id.videoId 
                }
                else {
                    videoIds += item.id.videoId + ','
                }
            }
            var items = responseObject.items;
            var statisticsUrlString = 'https://www.googleapis.com/youtube/v3/videos?key=AIzaSyAWK6U5UuH8UPWlj1iLUQ4aI7ioL275PmI&part=snippet,statistics&id=' + videoIds
            client.get(statisticsUrlString, function(response) {
                var responseObject = JSON.parse(response)
                for(var i = 0; i < items.length; ++i) {
                   var statisticItem = responseObject.items[i]
                   var item = items[i];
                   item.statistics = statisticItem.statistics;
                }
                self.newItemsReceived(items)
            });
        });
    }
}