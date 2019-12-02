let setUp = async () => {
  //get restaurant name
  let r = getUrlVars()['restaurant'].replace('+', ' ');

  //get restaurant info
  let restaurantData = await fetch(`/getRestaurant/${r}`);
  let rData = await restaurantData.json();
  let rID = rData['ID'];

  //get reviews for the restaurant
  let reviewData = await fetch(`/getRatings/${rID}`);
  let reviewResponse = await reviewData.json();
  console.log(reviewResponse);

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

  createCloud(frequency_list);
};

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
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
      interval: 1
    },
    axisY2: {
      interlacedColor: 'rgba(1,77,101,.2)',
      gridColor: 'rgba(1,77,101,.1)',
      title: 'Frequency'
    },
    data: [
      {
        type: 'bar',
        name: 'companies',
        axisYType: 'secondary',
        color: '#014D65',
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
  Object.keys(words).forEach(function(key) {
    objs.push({ word: key, size: words[key] });
  });
  console.log(objs);
  return objs;
}

function createCloud(myWords) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  var svg = d3
    .select('#cloud')
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
      myWords.map(function(d) {
        return { text: d.word, size: d.size * 20 };
      })
    )
    .padding(5) //space between words
    .rotate(function() {
      return ~~(Math.random() * 2) * 90;
    })
    .fontSize(function(d) {
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
      .style('font-size', function(d) {
        return d.size;
      })
      .style('fill', '#69b3a2')
      .attr('text-anchor', 'middle')
      .style('font-family', 'Impact')
      .attr('transform', function(d) {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      .text(function(d) {
        return d.text;
      });
  }
}

setUp();
