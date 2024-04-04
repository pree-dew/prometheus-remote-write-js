const express = require('express');
const { Counter, Histogram, Gauge, Summary, register } = require('prom-client');
const PushMetrics  = require('../prometheus/remotewrite');

const app = express();
const port = 9000;

// Define and register custom metrics
const customCounter = new Counter({
  name: 'custom_counter',
  help: 'A custom counter metric',
});

const customHistogram = new Histogram({
  name: 'custom_histogram',
  help: 'A custom histogram metric',
  buckets: [0.1, 0.5, 1, 2, 5],
});

const customGauge = new Gauge({
	name: 'custom_gauge',
	help: 'A custom gauge metric',
});

const customSummary = new Summary({
	name: 'custom_summary',
	help: 'A custom summary metric',
});

// Route to record a value in the custom histogram metric
app.get('/record', (req, res) => {
  customSummary.observe(Math.random() * 10);
  customHistogram.observe(Math.random() * 10);
  res.send('Value recorded in histogram');
});

// Route to increment the custom counter metric
app.get('/increment', (req, res) => {
  customCounter.inc();
  customGauge.inc();
  res.send('Counter incremented');
});

// Uncomment it, if you want to see what are the metrics available
//app.get('/metrics', async (req, res) => {
//  try {
//    const metrics = await register.metrics();
//    res.set('Content-Type', register.contentType);
//    res.send(metrics);
//  } catch (error) {
//    console.error('Error generating Prometheus metrics:', error);
//    res.status(500).send('Internal Server Error');
//  }
//});


// Just push some metrics metrics
async function prometheusRemoteWrite() {
  const metrics = await register.getMetricsAsJSON();

  
  PushMetrics(
  metrics,
  {
    url: 'http://localhost:9090/api/v1/write',
    labels: { service: "sample-service" },
  });
};

// Set the frequency of remote write
setInterval(prometheusRemoteWrite, 10000);

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

