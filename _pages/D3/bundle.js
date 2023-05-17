(function () {
      'use strict';

      const {
              csv,
              select,
              scaleLinear,
              scaleSqrt,
              extent,
              axisLeft,
              axisBottom,
              json,
            } = d3;

            function getStyle(selector, property) {
              for (
                let i = 0;
                i < document.styleSheets.length;
                i++
              ) {
                const rules =
                  document.styleSheets[i].cssRules;

                for (let j = 0; j < rules.length; j++) {
                  if (
                    rules[j].selectorText === selector
                  ) {
                    return rules[
                      j
                    ].style.getPropertyValue(property);
                  }
                }
              }
              return null;
            }

            const width = window.innerWidth;
            const height = window.innerHeight;

            const titleFontSize =
              ((parseInt(
                getStyle('.chart-title', 'font-size')
              ) *
                height) /
                100) *
              1.5;
            const axisLabelFontSize =
              ((parseInt(
                getStyle('.axis-label', 'font-size')
              ) *
                height) /
                100) *
              1.5;
            const axisSubLabelFontSize =
              ((parseInt(
                getStyle('.axis-sub-label', 'font-size')
              ) *
                height) /
                100) *
              1.5;
            const tickFontSize =
              ((parseInt(
                getStyle('.tick text', 'font-size')
              ) *
                height) /
                100) *
              1.5;
            ((parseInt(
                getStyle('.tick text', 'font-size')
              ) *
                height) /
                100) *
              1.5;
            ((parseInt(
                getStyle(
                  '.legend-title text',
                  'font-size'
                )
              ) *
                height) /
                100) *
              1.5;
            const vertical_line_spacing = 8;
            const margin = {
              top: titleFontSize,
              right: 125,
              bottom:
                axisLabelFontSize +
                axisSubLabelFontSize +
                tickFontSize,
              left:
                axisLabelFontSize * 1.75 +
                tickFontSize +
                vertical_line_spacing,
            };

            const csvUrl =
              'https://gist.githubusercontent.com/MoneyBrawl/cad88e6659bf59c9d5bdc80c6efe4da0/raw/68ed2ea48251aefeedc15ebc378c9bdf92540ee2/UGA_OC.csv';
            const parseRow = (d, coordinators) => {
              d.recruiting = +d.average_of_4_year_avg_recruiting_points;
              d.avg_ppg = +d.avg_ppg;
              d.avg_opponent_ppg = +d.avg_opponent_ppg;
              d.coordinator_color =
                coordinators[d.coordinator]['color'];
              return d;
            };

            const xValue = (d) => d.recruiting;
            const yValue = (d) => d.avg_ppg;
            const rValue = (d) => d.avg_opponent_ppg;
            const color = (d) => d.coordinator_color;
            const label = (d) => d.coordinator;
            const name = (d) => d.coordinator;

            const xPaddingPerc = 10;
            const yPaddingPerc = 5;

            const extentSize = (
              d,
              valueAccessor,
              paddingPerc
            ) => {
              let dataExtent = extent(d, valueAccessor);
              const size =
                dataExtent[1] - dataExtent[0];
              dataExtent[1] = Math.ceil(
                dataExtent[1] + size / paddingPerc
              );
              dataExtent[0] = Math.floor(
                dataExtent[0] - size / paddingPerc
              );
              return dataExtent;
            };

            d3
              .select('body')
              .append('div')
              .attr('class', 'tooltip');

            const svg = select('body')
              .append('svg')
              .attr('width', width)
              .attr('height', height);

            // Title
            svg
              .append('text')
              .attr('x', (width + margin.left) / 2)
              .attr('y', 0 + margin.top)
              .attr('text-anchor', 'middle')
              .attr('class', 'chart-title')
              .attr(
                'dominant-baseline',
                'text-after-edge'
              )
              .text('PPG vs. Recruiting');

            const main = async () => {
              console.log("Here!");
              const coordinators = await json(
                '{{ site.baseurl }}/assets/coordinators.json'
              );
              const data = await csv(csvUrl, (d) =>
                parseRow(d, coordinators)
              );

              const x = scaleLinear()
                .domain(
                  extentSize(data, xValue, xPaddingPerc)
                )
                .range([
                  margin.left,
                  width - margin.right,
                ]);

              const y = scaleLinear()
                .domain(
                  extentSize(data, yValue, yPaddingPerc)
                )
                .range([
                  height - margin.bottom,
                  margin.top,
                ]);

              const r = scaleSqrt()
                .domain([10, 25]) //extent(data, rValue))
                .range([5, 50]);

              const get_tooltip = (d) => {
                return (
                  '(X): Avg. Recruiting Score - ' +
                  parseFloat(
                    d.average_of_4_year_avg_recruiting_points
                  ).toFixed(0) +
                  '<br>' +
                  '(Y): Avg. PPG - ' +
                  parseFloat(d.avg_ppg).toFixed(1) +
                  '<br>' +
                  '(Size) Avg. Opponent PPG: ' +
                  parseFloat(
                    d.avg_opponent_ppg
                  ).toFixed(1) +
                  '<br><br>' +
                  'Other Metrics of Interest<br>' +
                  '# Uga Games Coached: ' +
                  parseInt(d.num_games) +
                  '<br>' +
                  'PPG StDev: ' +
                  parseFloat(d.stddev_ppg).toFixed(1) +
                  '<br>' +
                  'Median PPG: ' +
                  parseFloat(d.median_ppg).toFixed(1)
                );
              };

              const marks = data.map((d) => ({
                x: x(xValue(d)),
                y: y(yValue(d)),
                r: r(rValue(d)),
                color: color(d),
                label: label(d),
                name: name(d),
                height: 0,
                width: 0,
                tooltip: get_tooltip(d),
              }));

              ({ ...marks });

              ////////////////////////////////////////////////////////////
              // Y Axis
              ////////////////////////////////////////////////////////////
              const yAxis = axisLeft(y).tickSize(
                -(width - margin.left - margin.right)
              );
              svg
                .append('g')
                .attr(
                  'transform',
                  `translate(${margin.left},0)`
                )
                .call(yAxis);

              const yLabel = svg
                .append('text')
                .attr('class', 'axis-label')
                .attr('transform', `rotate(-90)`)
                .attr('y', 0)
                .style('text-anchor', 'middle');

              const yLabel1 = 'UGA Career Average';
              const yLabel2 = 'Points Per Game';

              yLabel
                .append('tspan')
                .text(yLabel1)
                .attr(
                  'x',
                  -(height - margin.bottom) / 2
                )
                .attr('dy', '1.2em');

              yLabel
                .append('tspan')
                .text(yLabel2)
                .attr(
                  'x',
                  -(height - margin.bottom) / 2
                )
                .attr('dy', '1em');

              ////////////////////////////////////////////////////////////
              // X Axis
              ////////////////////////////////////////////////////////////
              const xAxis = axisBottom(x).tickSize(
                -(height - margin.bottom - margin.top)
              );
              svg
                .append('g')
                .attr(
                  'transform',
                  `translate(0, ${
              height - margin.bottom
            })`
                )
                .call(xAxis);

              svg
                .append('text')
                .attr('id', 'xlabel')
                .attr('class', 'axis-label')
                .attr('x', width / 2 + margin.left / 2)
                .attr(
                  'y',
                  height -
                    axisSubLabelFontSize -
                    axisLabelFontSize / 6 -
                    vertical_line_spacing
                ) // Set below
                .style('text-anchor', 'middle')
                .text('Average Recruiting Score');
              // X-Axis
              svg
                .append('text')
                .attr('id', 'xsublabel')
                .attr('class', 'axis-sub-label')
                .attr('x', width / 2 + margin.left / 2)
                .attr(
                  'y',
                  height - vertical_line_spacing
                )
                .style('text-anchor', 'middle')
                .text(
                  "(Each season's recruiting score is the average Rivals score for the 4 prior recruiting classes.)"
                );

              ////////////////////////////////////////////////////////////
              // Formatting
              ////////////////////////////////////////////////////////////

              const groups = svg
                .selectAll('g.mark-group')
                .data(marks)
                .join('g')
                .attr('class', 'mark-group');

              // Then add the circles to the 'g' elements
              const circles = groups
                .append('circle')
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .attr('r', (d) => d.r)
                .attr('fill', (d) => d.color);

              // Finally, add the text to the 'g' elements.
              // Each line will be a separate 'tspan' element, and their 'dy' attribute will control line spacing.
              const labels = groups
                .append('text')
                .attr('x', (d) => d.x)
                .attr('y', (d) => d.y)
                .attr(
                  'text-anchor',
                  (d) =>
                    coordinators[d.name]['text-anchor']
                )
                .attr(
                  'dominant-baseline',
                  (d) =>
                    coordinators[d.name][
                      'alignment-baseline'
                    ]
                )
                .each(function (d) {
                  const lines = d.label.split('\n');
                  const textEl = d3.select(this);

                  lines.forEach((line, i) => {
                    textEl
                      .append('tspan')
                      .attr('dy', i === 0 ? 0 : '1.2em')
                      .attr('x', (d) => d.x)
                      .attr('y', (d) => d.y)
                      .text(line);
                  });
                });

              // const tooltips = svg
              //   .selectAll('circle')
              //   .data(marks)
              //   .append('title')
              //   .text((d) => d.tooltip);

              const tooltip = d3.select('.tooltip');
              circles
                .on('mouseenter', (event, d) => {
                  // Show the tooltip and set its content
                  tooltip
                    .style('opacity', 1)
                    .html(d.tooltip);
                })
                .on('mousemove', (event) => {
                  // Update the tooltip position based on the mouse position
                  tooltip
                    .style(
                      'left',
                      event.pageX + 10 + 'px'
                    )
                    .style(
                      'top',
                      event.pageY - 10 + 'px'
                    );
                })
                .on('mouseleave', () => {
                  // Hide the tooltip
                  tooltip.style('opacity', 0);
                });

              svg
                .selectAll('.link')
                .data(marks)
                .enter()
                .append('line')
                .attr('class', 'link')
                .attr('x1', function (d) {
                  return d.x;
                })
                .attr('y1', function (d) {
                  return d.y;
                })
                .attr('x2', function (d) {
                  return d.x;
                })
                .attr('y2', function (d) {
                  return d.y;
                })
                .attr('stroke-width', 0.6)
                .attr('stroke', 'gray')
                .attr('stroke-width', 1)
                .attr('stroke-linecap', 'round');

              const original_marks = JSON.parse(
                JSON.stringify(marks)
              );

              marks.forEach(function (mark) {
                if (mark.name === 'Schottenheimer') {
                  mark['y'] = mark['y'] - mark['r'] - 5;
                } else {
                  mark['y'] = mark['y'] + mark['r'] + 5;
                }
              });

              function redrawLabels() {
                // Redraw labels and leader lines
                labels.each(function (d, i) {
                  // console.log(marks[i].x);
                  d3.select(this)
                    .selectAll('tspan')
                    .transition()
                    .duration(800)
                    .attr('x', marks[i].x)
                    .attr('y', marks[i].y);
                });
              }

              redrawLabels();

              svg
                .append('g')
                .selectAll('circle')
                .data(original_marks)
                .join('circle')
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .attr('r', (d) => 2)
                .attr('fill', (d) =>
                  d.name === 'Monken'
                    ? '#FFFFFF'
                    : '#000000'
                );
              const legendData = [
                { value: 10, label: '10' },
                { value: 15, label: '15' },
                { value: 20, label: '20' },
                { value: 25, label: '25' },
              ];

              // Create the legend group and assign it an x and y position
              const legend = svg
                .append('g')
                .attr('class', 'legend')
                .attr(
                  'transform',
                  `translate(${
              width - margin.right / 2
            },${margin.top + 50})`
                );

              // Create circles in the legend
              legend
                .selectAll('circle')
                .data(legendData)
                .join('circle')
                .attr('r', (d) => r(d.value))
                // .attr("cx", (d) => r(d.value))
                .attr('cy', (d, i) => {
                  let yOffset = 0;
                  for (let j = 0; j < i; j++) {
                    yOffset +=
                      r(legendData[j].value) * 2 + 30;
                  }
                  return yOffset;
                })
                .attr('fill', 'grey')
                .attr('opacity', 0.3)
                .attr('stroke-width', 3);
              // Create text labels for the legend circles
              legend
                .selectAll('text')
                .data(legendData)
                .join('text')
                .attr('x', (d) =>
                  d.value === 10 ? r(d.value) * 2 : 0
                )
                .attr('y', (d, i) => {
                  let yOffset = 0;
                  for (let j = 0; j < i; j++) {
                    yOffset +=
                      r(legendData[j].value) * 2 + 30;
                  }
                  return yOffset;
                })
                .attr('text-anchor', (d) =>
                  d.value === 10 ? 'left' : 'middle'
                )
                .attr('dy', '0.3em')
                .text((d) => d.label);

              legend
                .append('text')
                .attr('class', 'legend-title')
                .attr('text-anchor', 'middle')
                .append('tspan')
                .attr('x', 0)
                .attr('y', 290)
                .text('Opponent')
                .append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text('PPG');
            };

            main();

})();
//# sourceMappingURL=bundle.js.map
