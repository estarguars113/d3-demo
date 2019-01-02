import * as d3 from 'd3';

let store = {};

function loadData() {
    d3.csv('./src/routes.csv')
        .then( data => {
            store.routes = data;
            showData();
            return store;
        })
        .catch( e => {
            console.log(e);
        });
}

function groupByAirline(data) {
    //Iterate over each route, producing a dictionary where the keys is are the ailines ids and the values are the information of the airline.
    let result = data.reduce((result, d) => {
        let currentData = result[d.AirlineID] || {
            'AirlineID': d.AirlineID,
            'AirlineName': d.AirlineName,
            'Count': 0
        };
        
        currentData.Count += 1;
        
        result[d.AirlineID] = currentData;

        return result;
    }, {});

    result = Object.keys(result).map(key => result[key]);
    result = result.sort(function(x, y){
        return d3.descending(x.Count, y.Count);
    });
    return result;
}

function showData() {
    let airlines = groupByAirline(store.routes);
    drawAirlinesChart(airlines);
}

function drawAirlinesChart(airlines) {
    let config = getAirlinesChartConfig();
    let scales = getAirlinesChartScales(airlines, config);
    drawBarsAirlinesChart(airlines, scales, config);
    drawAxesAirlinesChart(airlines, scales, config);

}

function getAirlinesChartConfig() {
    let width = 350;
    let height = 400;
    let margin = {
        top: 10,
        bottom: 50,
        left: 130,
        right: 10
    };
    let bodyHeight = height - margin.top - margin.bottom;
    let bodyWidth = width - margin.left - margin.right;

    let container = d3.select('#AirlinesChart');
    container
        .attr('width', width)
        .attr('height', height);

    return { width, height, margin, bodyHeight, bodyWidth, container };
}

function getAirlinesChartScales(airlines, config) {
    let { bodyWidth, bodyHeight } = config;
    let maximunCount = d3.max(
        airlines.map(
            d => {
                return d.Count;
            }));

    let xScale = d3.scaleLinear()
        .range([0, bodyWidth])
        .domain([0, maximunCount]);

    let yScale = d3.scaleBand()
        .range([0, bodyHeight])
        .domain(airlines.map(a => a.AirlineName)) //The domain is the list of ailines names
        .padding(0.2);
        
    return { xScale, yScale };
}

function drawBarsAirlinesChart(airlines, scales, config) {
    let { margin, container } = config;
    let { xScale, yScale } = scales;
    let body = container.append('g')
        .style(
            'transform', 
            `translate(${margin.left}px,${margin.top}px)`
        );
  
    let bars = body.selectAll('.bar').data(airlines);
  
    //Adding a rect tag for each airline
    bars.enter().append('rect')
        .attr('height', yScale.bandwidth())
        .attr('y', (d) => yScale(d.AirlineName))
        //TODO: set the width of the bar to be proportional to the airline count using the xScale
        .attr('width', (d) => xScale(d.Count))
        .attr('fill', '#2a5599');
}

function drawAxesAirlinesChart(airlines, scales, config){
    let {xScale, yScale} = scales;
    let {container, margin, height} = config;
    
    let axisX = d3.axisBottom(xScale).ticks(5);
  
    container.append('g')
        .style(
            'transform', 
            `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX);
  
    let axisY = d3.axisLeft(yScale);
    container.append('g')
        .style(
            'transform', 
            `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY);
}

loadData();