/**
 * Created by nezz on 15. 8. 2..
 */
var Xray = require('x-ray'),
    x = Xray(),
    Promise = require('bluebird'),
    _ = require('underscore'),
    moment = require('moment');

/**
 * http://youtubeowaraitv.blog32.fc2.com/ 메인화면에서 영상리스트 추출
 * @returns {bluebird|exports|module.exports}
 */
function getNewEpisodesList() {
    return new Promise(function (resolve, reject) {
        x('http://youtubeowaraitv.blog32.fc2.com/', 'div#mainBlock div.index_area div a', [{
            link: '@href',
            title: '@title'
        }])(function (err, list) {
            if (err)
                reject(err);
            else {
                list = _.map(list, function (episode) {
                    // episode id 분리
                    var episodeId = episode.link.substring(episode.link.lastIndexOf('-') + 1, episode.link.lastIndexOf('.'));
                    episode.id = episodeId;

                    // title 과 날짜 분리
                    var episodeDate = episode.title.substring(episode.title.lastIndexOf('　') + 1, episode.title.length);
                    episodeDate = moment().year() + '年' + episodeDate;
                    episode.date = moment(episodeDate,'YYYYMMDD').format('YYYYMMDD');

                    var episodeTitle = episode.title.substring(0, episode.title.lastIndexOf('　'));
                    episode.title = episodeTitle;

                    return episode;
                });

                resolve(list);
            }
        });
    });
}

function getEpisodeDetail(episodesList) {
    return new Promise(function (resolve, reject) {
        resolve(_.map(episodesList, function (episode) {
            x(episode.link, 'div#mainBlock div.mainEntryMore a', [{
                link: '@href',
                source: '@html'
            }])(function (err, list) {
                if (err) reject(err)
                else {
                    list = _.map(list, function(video) {
                        if (video.source.indexOf('&#x3010;') > -1) {
                            video.source = video.source.replace(/(&#x3010;|&#x3011;)/g, '');
                            return video;
                        } else {
                            return null;
                        }
                    });
                    list = _.reject(list, function(video) {
                        return video === null;
                    });

                    episode.videoList = list;
                    return episode;
                }
            });
        }));
    })
}
getNewEpisodesList().then(
    function (episodeList) {
        getEpisodeDetail(episodeList).then(
            function(result) {
                console.log(result)
            },
            function(err) {
                console.error(err);
            }
        )
    },
    function (err) {
        console.error(err);
    }
);
getEpisodeDetail();