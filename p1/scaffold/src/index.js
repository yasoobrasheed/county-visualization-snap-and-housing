// Util Functionality

import {findCountyColor} from './utils';
// import {findMinMax} from './utils'; **

// D3 Functionality

import {scaleQuantile} from 'd3-scale';
import {select} from 'd3-selection';
import {geoPath} from 'd3-geo';
import {json} from 'd3-fetch';
import {feature} from 'topojson';
import {lab} from 'd3-color';
// import {axisBottom} from 'd3-axis'; **
// import {axisLeft} from 'd3-axis'; **
// import {scaleLinear} from 'd3-scale'; **

// ** functions are used for commented-out
// scatter plot code below

const domReady = require('domready');

domReady(() => {
  fetch('./data/stats.json')
    .then(response => response.json())
    .then(data => myVis(data));
});

function myVis(data) {

  // landscape

  const height = 1000;
  const width = 36 / 24 * height;

  // Extract data points from counties object

  const dataValues = Object.values(data);
  const snapValues = dataValues.map(d => d[0]);
  const housingValues = dataValues.map(d => d[1]);

  // Define scales

  const snapScale = scaleQuantile().domain([...snapValues]).range([1, 2, 3, 4]);
  const housingScale = scaleQuantile().domain([...housingValues]).range([1, 2, 3, 4]);

  // Legend Scales

  const legendData = [...new Array(16)].map((d, i) => i);

  function legendX(ti) {
    return width - (width / 5.75) + (height / 40) * (Math.floor(ti / 4));

  }
  function legendY(ti) {
    return height - (height / 3) + ((height / 40) * (ti % 4));
  }

  function legendColor(ti) {
    const x = (4 - (ti % 4));
    const y = Math.floor(ti / 4) + 1;
    return (lab(20 + 10 * ((5 - x) + (5 - y)), 0, (y - x) * 40));
  }

  // Define SVG selection

  const svg = select('.vis-container')
            .attr('width', width)
            .attr('height', height);

  // Add background

  svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#FAFBF2');

  // Add Title

  svg.append('text')
    .attr('class', 'title')
    .text('Reliance on SNAP and the Availability of Housing Units for ELI Renters')
    .attr('font-family', 'Gotham-bold')
    .attr('fill', '#5D5E5D')
    .attr('font-size', 32)
    .attr('transform', `translate(${width / 10 + 10},${height * 0.09}) scale(1,1)`);

  // Add Blurb

  svg.append('text')
    .attr('class', 'description')
    .text(`Throughout the country, there is great disparity between participation
           in the Supplemental Nutrition Assistance Program and the availability of affordable housing 
           for extremely low income households`)
    .attr('font-family', 'Gotham-light')
    .attr('fill', '#5D5E5D')
    .attr('font-size', 18)
    .attr('transform', `translate(${width / 40},${height * 0.135}) scale(1,1)`);

  // Create bivariate chloropeth

  const path = geoPath();

  json('/data/counties.json').then((us) => {
    svg.append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(feature(us, us.objects.counties).features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', d => findCountyColor(d.id, data, snapScale, housingScale))
    .attr('transform', `translate(${height / 12}, ${height / 6}) scale(${5 / 4})`);
  });

  // Append legend

  svg.selectAll('legend').data(legendData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('width', height / 45)
      .attr('height', height / 45)
      // x = 150, y = -1100
      .attr('x', d => legendX((d) % 16) + (height / (20 / 3)))
      .attr('y', d => legendY((d) % 16) - (height * 1.1))
      .attr('transform', 'rotate(45)')
      .attr('fill', d => (legendColor(d)));

  // Legend annotations

  const legendAnnotations = [
  {text: 'Low SNAP Rate', x: (width - width / 5.75), y: (height - height / 2.9)},
  {text: 'Few Housing Units', x: (width - width / 5.5), y: (height - height / 3)},
  {text: 'Low SNAP Rate', x: (width - width / 4.05), y: (height - height / 3.5)},
  {text: 'Many Housing Units', x: (width - width / 3.75), y: (height - height / 3.65)},
  {text: 'High SNAP Rate', x: (width - width / 10), y: (height - height / 3.5)},
  {text: 'Few housing units', x: (width - width / 10), y: (height - height / 3.65)},
  {text: 'High SNAP Rate', x: (width - width / 5.75), y: (height - height / 6)},
  {text: 'Many Housing Units', x: (width - width / 5.45), y: (height - height / 6.5)}
  ];

  svg.selectAll('legend annotation').data(legendAnnotations)
    .enter()
    .append('text')
    .attr('class', 'annotation')
    .text(d => d.text)
    .attr('font-family', 'Lucida Grande')
    .attr('fill', '#5D5E5D')
    .attr('transform', d => `translate(${d.x},${d.y}) scale(0.8,0.8)`);

  // Append missing data annotation

  svg.append('rect')
      .attr('width', height / 45)
      .attr('height', height / 45)
      .attr('transform', `translate(${width - 210.5}, ${height - 100}) rotate(45)`)
      .attr('fill', lab(50, -160, 0));

  svg.append('text')
    .attr('class', 'src')
    .text('No Data Available')
    .attr('font-family', 'Lucida Grande')
    .attr('fill', '#5D5E5D')
    .attr('font-size', 13)
    .attr('transform', `translate(${width - 272.5},${height * 0.95}) scale(1,1)`);

  // Add Sources
  svg.append('text')
    .attr('class', 'src')
    .text('Data collected from 2010 - 2016')
    .attr('font-family', 'Lucida Grande')
    .attr('fill', '#5D5E5D')
    .attr('font-size', 12)
    .attr('transform', `translate(${width * 0.01},${height * 0.955}) scale(1,1)`);
  svg.append('text')
    .attr('class', 'src')
    .text('Housing Data from The Urban Institute: http://apps.urban.org/features/rental-housing-crisis-map/')
    .attr('font-family', 'Lucida Grande')
    .attr('fill', '#5D5E5D')
    .attr('font-size', 12)
    .attr('transform', `translate(${width * 0.01},${height * 0.97}) scale(1,1)`);
  svg.append('text')
    .attr('class', 'src')
    .text('SNAP Data from FRAC: http://www.frac.org/snap-county-map/tables/snap-county-tab-2016.html')
    .attr('font-family', 'Lucida Grande')
    .attr('fill', '#5D5E5D')
    .attr('font-size', 12)
    .attr('transform', `translate(${width * 0.01},${height * 0.985}) scale(1,1)`);

  // Scatter plot code

  /*  // Define scales

    //Extend layout

    const margin = {left: 10, right: 10, bottom: 10, top: 10};

    const snapStats = findMinMax(dataValues, 0);
    const housingStats = findMinMax(dataValues, 1);

    const xScale = scaleLinear()
          .domain([snapStats.min, snapStats.max])
          .range([margin.left, width - margin.right]);

    const yScale = scaleLinear()
          .domain([housingStats.min, housingStats.max])
          .range([height - margin.bottom, margin.top]);

    // Add points

    svg.selectAll('circle')
          .data(dataValues)
          .enter().append('circle')
          .attr('class', 'circle')
          .attr('cx', d => xScale(d[0]))
          .attr('cy', d => yScale(d[1]))
          .attr('r', 2)
          .attr('fill', 'black');

    // Add axes

    svg.append('g')
          .attr('transform', `translate(0, ${height - margin.bottom})`)
          .call(axisBottom(xScale))
          .append('text')
          .attr('x', width / 2.2)
          .attr('y', margin.bottom / 3.5)
          .attr('text-anchor', 'start')
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .text('SNAP participation rates (%)');

    svg.append('g')
          .attr('transform', `translate(${margin.left}, 0)`)
          .call(axisLeft(yScale))
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('x', -(width / 2))
          .attr('y', -(margin.bottom / 4))
          .attr('text-anchor', 'start')
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .text('Units per 100 ELI Renter Households');*/
}
