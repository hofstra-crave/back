let setUp = async () => {
  //get restaurant name
  let r = getUrlVars()['restaurant'].replace('+', ' ');

  //get restaurant info
  let restaurantData = await fetch(`/getRestaurant/${r}`);
  let rData = await restaurantData.json();
  let rID = rData['ID'];

  //get reviews for the restaurant
  let reviewData = await fetch(`/getRatings/${rID}/pos`);
  let reviewData2 = await fetch(`/getRatings/${rID}/neg`);
  let reviewResponse = await reviewData.json();
  let reviewResponse2 = await reviewData2.json();

  reviewResponse = reviewResponse.concat(reviewResponse2);

  var rating = avgRating(reviewResponse);
  var roundedRating = rounding(rating);

  var graph = createGraph(reviewResponse, r);
  var count = 5;

  //Display Restaurant Info
  window.document.querySelector('title').innerText = r;
  window.document.querySelector('.header').innerText = r;
  window.document.querySelector('.description').innerText = rData.Description;
  window.document.querySelector('.score').innerText = rating * 20 + ' / 100';

  //Display Star rating
  while (roundedRating > 0 || count > 0) {
    if (roundedRating > 1) {
      var span = document.createElement('SPAN');
      span.className = 'fa fa-star checked';
      document.querySelector('.star-rating').appendChild(span);
    } else if (roundedRating >= 0.5) {
      var span = document.createElement('SPAN');
      span.className = 'fa fa-star-half checked';
      document.querySelector('.star-rating').appendChild(span);

      var span = document.createElement('SPAN');
      span.className = 'fa fa-star-half fa-flip-horizontal';
      document.querySelector('.star-rating').appendChild(span);
    } else {
      var span = document.createElement('SPAN');
      span.className = 'fa fa-star';
      document.querySelector('.star-rating').appendChild(span);
    }
    roundedRating--;
    count--;
  }

  var frequency_list = tfidf(reviewResponse);
  var frequency_list2 = tfidf(reviewResponse2);

  createCloud(frequency_list, 'cloud1');
  createCloud(frequency_list2, 'cloud2');

  let simID = rData['SimilarID'];

  let simRes = await fetch(`/getRestaurantByID/${simID}`);
  let simRes2 = await simRes.json();
  let simData = simRes2[0];

  //get reviews for the restaurant
  let simreviewData = await fetch(`/getRatings/${simID}/pos`);
  let simreviewData2 = await fetch(`/getRatings/${simID}/neg`);
  let simreviewResponse = await simreviewData.json();
  let simreviewResponse2 = await simreviewData2.json();

  simreviewResponse = simreviewResponse.concat(simreviewResponse2);

  var simrating = avgRating(simreviewResponse);
  var simroundedRating = rounding(simrating);

  var name = document.createElement('H2');
  name.innerText = simData['Name'];
  document.querySelector('#similar').appendChild(name);
  let simDes = document.createElement('P');

  if (simroundedRating >= 75) {
    simDes.innerText = `${simData['Name']} is doing fine so you should be okay`;
  } else if (simroundedRating >= 50 && simroundedRating <= 74) {
    simDes.innerText = `${simData['Name']} could be doing better. Might want to look at what you could be doing beter too.`;
  } else {
    simDes.innerText = `${simData['Name']} is not doing well. Might want to improve yourself as well.`;
  }
  document.querySelector('#similar').appendChild(simDes);
};

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function avgRating(x) {
  sum = 0;
  x.forEach(y => {
    sum += y['Rating'];
  });

  return Math.round((sum / x.length) * 100) / 100;
}

function rounding(num) {
  return Math.round(num * 2) / 2;
}

function createGraph(reviews, resName) {
  dataPoints = [];
  y = [0, 0, 0, 0, 0, 0];
  reviews.forEach(z => {
    y[z['Rating']] += 1;
  });
  y.forEach(x => {
    dataPoints.push({ y: x });
  });
  var chart = new CanvasJS.Chart('chartContainer', {
    animationEnabled: true,

    title: {
      text: resName
    },
    axisX: {
      interval: 1,
      title: 'Review Score (out of 5)'
    },
    axisY2: {
      interlacedColor: 'rgba(128,128,128,.2)',
      gridColor: 'rgba(128,128,128,.1)',
      title: 'Review Frequency'
    },
    data: [
      {
        type: 'bar',
        name: 'companies',
        axisYType: 'secondary',
        color: '#CE961F',
        dataPoints: dataPoints
      }
    ]
  });
  chart.render();
}

function tfidf(reviewResponse) {
  var words = {};
  reviewResponse.forEach(x => {
    const s = x['Review_Text'].split(' ');
    s.forEach(w => {
      if (words[`${w}`] === undefined) {
        words[`${w}`] = 0;
      }
      words[`${w}`] = words[`${w}`] + 1;
    });
  });

  var objs = [];
  Object.keys(words).forEach(function (key) {
    objs.push({ word: key, size: words[key] });
  });
  return objs;
}

function createCloud(myWords, divName) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  var svg = d3
    .select('#' + divName)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
  // Wordcloud features that are different from one word to the other must be here
  var layout = d3.layout
    .cloud()
    .size([width, height])
    .words(
      myWords.map(function (d) {
        return { text: d.word, size: d.size * 20 };
      })
    )
    .padding(5) //space between words
    .rotate(function () {
      return ~~(Math.random() * 2) * 90;
    })
    .fontSize(function (d) {
      return d.size;
    }) // font size of words
    .on('end', draw);
  layout.start();

  // This function takes the output of 'layout' above and draw the words
  // Wordcloud features that are THE SAME from one word to the other can be here
  function draw(words) {
    svg
      .append('g')
      .attr(
        'transform',
        'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')'
      )
      .selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', function (d) {
        return d.size;
      })
      .style('stroke', '#131313')
      .style('stroke-width', '0.6%')
      .style('fill', '#eee')
      .attr('text-anchor', 'middle')
      .style('font-family', 'Impact')
      .attr('transform', function (d) {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      .text(function (d) {
        return d.text;
      });
  }
}

setUp();
