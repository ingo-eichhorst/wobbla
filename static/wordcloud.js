/* global d3 */

/**
 * Modern Word Cloud Visualization with D3.js
 * Features: Smooth animations, modern design, interactivity, 60 FPS performance
 */

class ModernWordCloud {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.width = options.width || this.container.clientWidth || 800;
    this.height = options.height || 600;
    this.previousWords = new Map();

    // Animation settings
    this.animationDuration = options.animationDuration || 500;
    this.animationEasing = d3.easeCubicInOut;
    this.staggerDelay = options.staggerDelay || 50;

    // Color scheme - semantic colors based on frequency
    this.colorScale = d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateRgb('#94a3b8', '#3b82f6'));

    // Font settings
    this.fontFamily = options.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.fontWeightScale = d3.scaleLinear().domain([0, 100]).range([300, 900]);

    // Size scaling
    this.sizeScale = d3.scaleLinear().domain([1, 100]).range([12, 72]);

    // Initialize SVG
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', '#ffffff');

    // Create a group for the word cloud with transform capabilities
    this.cloudGroup = this.svg.append('g').attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    // Create tooltip
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'word-cloud-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('font-family', this.fontFamily);
  }

  /**
   * Simple hash function to generate a seed from a string
   * @param {string} str - String to hash
   * @returns {number} - Hash value
   */
  // eslint-disable-next-line class-methods-use-this
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      // Simple hash algorithm (djb2)
      hash = hash * 33 + char;
      // Keep it bounded
      hash %= 2147483647;
    }
    return Math.abs(hash);
  }

  /**
   * Create a seeded random number generator
   * @param {number} seed - Seed value
   * @returns {function} - Random function
   */
  // eslint-disable-next-line class-methods-use-this
  seededRandom(seed) {
    let s = seed;
    return function () {
      // Linear congruential generator
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /**
   * Update the word cloud with new data
   * @param {Array} words - Array of word objects with {text, size, channels}
   */
  update(words) {
    if (!words || words.length === 0) {
      return;
    }

    // Normalize sizes for scaling
    const maxSize = d3.max(words, (d) => d.size);
    const minSize = d3.min(words, (d) => d.size);

    this.sizeScale.domain([minSize, maxSize]);
    this.colorScale.domain([minSize, maxSize]);
    this.fontWeightScale.domain([minSize, maxSize]);

    // Prepare words for layout
    const cloudWords = words.map((word, index) => ({
      text: word.text,
      size: this.sizeScale(word.size),
      originalSize: word.size,
      channels: word.channels,
      weight: this.fontWeightScale(word.size),
      color: this.colorScale(word.size),
      index, // Store index for deterministic seeding
    }));

    // Create a deterministic seed based on the word set
    // This ensures consistent layouts for the same set of words
    const wordSetKey = cloudWords.map((w) => w.text).join('|');
    const seed = this.hashString(wordSetKey);

    // Create word cloud layout with deterministic random function
    // This provides both collision detection AND position stability
    const layout = d3.layout
      .cloud()
      .size([this.width, this.height])
      .words(cloudWords)
      .padding(8) // Increased padding to prevent overlaps
      .rotate(() => 0) // Keep all words horizontal for readability
      .font(this.fontFamily)
      .fontSize((d) => d.size)
      .random(this.seededRandom(seed)) // Deterministic placement
      .on('end', (layoutWords) => this.draw(layoutWords));

    layout.start();
  }

  /**
   * Draw the word cloud with FLIP animations
   * @param {Array} layoutWords - Positioned words from d3-cloud layout
   */
  draw(layoutWords) {
    // Create a map of current words for easy lookup
    const currentWords = new Map(layoutWords.map((w) => [w.text, w]));

    // Bind data to text elements
    const text = this.cloudGroup.selectAll('text').data(layoutWords, (d) => d.text);

    // ENTER: New words appearing
    const enter = text
      .enter()
      .append('text')
      .style('font-family', this.fontFamily)
      .style('font-size', (d) => `${d.size}px`)
      .style('font-weight', (d) => d.weight)
      .style('fill', (d) => d.color)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .attr('text-anchor', 'middle')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .text((d) => d.text);

    // Add interactivity
    this.addInteractivity(enter);

    // Animate entrance
    enter
      .transition()
      .duration(this.animationDuration)
      .delay((d, i) => i * this.staggerDelay)
      .ease(this.animationEasing)
      .style('opacity', 1);

    // UPDATE: Existing words changing size/position
    text
      .transition()
      .duration(this.animationDuration)
      .ease(this.animationEasing)
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('font-size', (d) => `${d.size}px`)
      .style('font-weight', (d) => d.weight)
      .style('fill', (d) => d.color);

    // Add interactivity to updated elements
    this.addInteractivity(text);

    // EXIT: Words disappearing
    text.exit().transition().duration(this.animationDuration).ease(this.animationEasing).style('opacity', 0).remove();

    // Store current words for next update
    this.previousWords = currentWords;
  }

  /**
   * Add hover and click interactivity to words
   * @param {D3Selection} selection - D3 selection of text elements
   */
  addInteractivity(selection) {
    const { tooltip } = this;

    selection
      .on('mouseenter', function (event, d) {
        // Highlight effect
        d3.select(this)
          .transition()
          .duration(200)
          .style('font-weight', 900)
          .style('text-shadow', '0 0 10px rgba(59, 130, 246, 0.5)');

        // Show tooltip
        const channelNames = d.channels.map((ch) => ch.name || ch.chName).join(', ');
        tooltip
          .html(
            `
            <strong>${d.text}</strong><br/>
            Frequency: ${d.originalSize}<br/>
            Channels: ${channelNames}
          `
          )
          .style('visibility', 'visible');
      })
      .on('mousemove', function (event) {
        tooltip.style('top', `${event.pageY - 10}px`).style('left', `${event.pageX + 10}px`);
      })
      .on('mouseleave', function (event, d) {
        // Remove highlight
        d3.select(this).transition().duration(200).style('font-weight', d.weight).style('text-shadow', 'none');

        // Hide tooltip
        tooltip.style('visibility', 'hidden');
      })
      .on('click', function (event, d) {
        // Log click for potential filtering functionality
        console.log('Word clicked:', d.text, 'Channels:', d.channels);
        // TODO: Implement filtering by word/channel
      });
  }

  /**
   * Resize the word cloud
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;

    this.svg.attr('width', width).attr('height', height);

    this.cloudGroup.attr('transform', `translate(${width / 2},${height / 2})`);
  }

  /**
   * Clear the word cloud
   */
  clear() {
    this.cloudGroup.selectAll('text').remove();
    this.previousWords.clear();
  }
}

// Make ModernWordCloud globally available for the controller
// eslint-disable-next-line no-unused-expressions
typeof window !== 'undefined' && (window.ModernWordCloud = ModernWordCloud);
