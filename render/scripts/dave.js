var DaveGui = React.createClass({
  apiCallPoints: function(http_method) {
    $.ajax({
      url: this.props.url + "points",
      dataType: 'json',
      type: http_method,
      cache: false,
      success: function(data) {
        this.setState({points: data.points, fit: this.state.fit});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  loadPointsFromServer: function() {
    this.apiCallPoints('GET')
  },
  addPointOnServer: function() {
    this.apiCallPoints('POST')
  },
  deletePointsOnServer: function() {
    this.apiCallPoints('DELETE')
  },
  componentDidMount: function() {
    this.loadPointsFromServer();
  },
  getInitialState: function() {
    return { points: [], fit: '' };
  },
  render: function() {

    return (
      <div className="daveGui">
        <PageHeader />
        <table><tbody>
          <tr>
          <td valign="top" >
            <ButtonPanel
              get_points={this.loadPointsFromServer}
              add_point={this.addPointOnServer}
              delete_points={this.deletePointsOnServer} />
          </td>
          <td>
            <PlotPanel points={this.state.points} fit={this.state.fit} />
          </td>
          </tr>
        </tbody></table>
      </div>
    );
  }
});

var PageHeader = React.createClass({
  render: function() {

    return (
      <div className="pageHeader">
      <div className="jumbotron">
          <div className="container">
              <h2>DAVE Technology Demonstration</h2>
              <p>This is a DAVE technology demonstration prototype.
              It is a <a href="https://facebook.github.io/react/">React.JS
              application</a> with a <a href="http://d3js.org/">D3.JS plot</a>,
              running on a <a href="http://flask.pocoo.org/">Flask server</a>.
              </p>
            </div>
          </div>
      </div>
    );
  }
});

var ButtonPanel = React.createClass({
  render: function() {

    return (
      <div className="buttonPanel">
      <ButtonPoints text="Add Point" onSubmit={this.props.add_point} />
      <ButtonPoints text="Clear Points" onSubmit={this.props.delete_points} />
      </div>
    );
  }
});

var Chart = React.createClass({
  render: function() {
    return (
      <svg width={this.props.width} height={this.props.height}>{this.props.children}</svg>
    );
  }
});

var Line = React.createClass({
  getDefaultProps: function() {
    return {
      path: '',
      color: 'blue',
      width: 2
    }
  },

  render: function() {
    return (
      <path d={this.props.path} stroke={this.props.color} strokeWidth={this.props.width} fill="none" />
    );
  }
});

var DataSeries = React.createClass({
  getDefaultProps: function() {
    return {
      data: [],
      interpolate: 'linear'
    }
  },

  render: function() {
    var self = this,
        props = this.props,
        yScale = props.yScale,
        xScale = props.xScale;

    var path = d3.svg.line()
        .x(function(d) { return xScale(d.x); })
        .y(function(d) { return yScale(d.y); })
        .interpolate(this.props.interpolate);

    return (
      <Line path={path(this.props.data)} color={this.props.color} />
    )
  }
});

var LineChart = React.createClass({
  getDefaultProps: function() {
    return {
      width: 600,
      height: 300
    }
  },

  render: function() {
    var data = this.props.data
    var size = { width: this.props.width, height: this.props.height };

    var xmin = _.chain(data).map(function(value) { return value.x }).min().value();
    var xmax = _.chain(data).map(function(value) { return value.x }).max().value();
    var ymax = _.chain(data).map(function(value) { return value.y }).max().value();

    var xScale = d3.scale.linear()
      .domain([xmin, xmax])
      .range([0, this.props.width]);

    var yScale = d3.scale.linear()
      .domain([0, ymax])
      .range([this.props.height, 0]);

    return (
      <Chart width={this.props.width} height={this.props.height}>
        <DataSeries data={data} size={size} xScale={xScale} yScale={yScale} ref="series1" color="cornflowerblue" />
      </Chart>
    );
  }
});

var PlotPanel = React.createClass({
  render: function() {

    // Go from (time, flux) points to (x, y) points for plotting.
    var xydata = this.props.points.map(function(point) {
      return { x: point.time, y: point.flux}
    })

    return (
      <div className="plotPanel">
        <LineChart data={xydata} />
      </div>
    );
  }
});

var Point = React.createClass({
  render: function() {
    return (
      <div className="point">
      Time: {this.props.time}, flux: {this.props.flux}
      </div>
    );
  }
});

var ButtonPoints = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onSubmit();
  },
  render: function() {
    return (
      <form className="btn_get_points" onSubmit={this.handleSubmit}>
      <input type="submit" value={this.props.text} />
      </form>
    );
  }
});

ReactDOM.render(
  <DaveGui url="http://localhost:5000/dave/api/v1.0/" />,
  document.getElementById('content')
);
