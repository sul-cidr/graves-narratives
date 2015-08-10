

import _ from 'lodash';
import $ from 'jquery';
import View from '../lib/view';
import * as styles from './text.yml';
import tipTpl from './tip.jade'


export default View.extend({


  el: '#text',


  events: {

    // Burials:
    'mouseenter span.burial': 'onBurialEnter',
    'mouseleave span.burial': 'onBurialLeave',
    'click span.burial': 'onBurialClick',

    // Sections:
    'mouseenter .section': 'onSectionEnter',
    'mouseleave .section': 'onSectionLeave',

  },


  channels: ['text', 'burials', 'sections', 'map'],


  // ** Publishers:


  /**
   * When the cursor enters a span.
   *
   * @param {Object} e
   */
  onBurialEnter: function(e) {
    let id = this.getBurialIdFromEvent(e);
    this.channels.burials.trigger('highlight', id);
    this.channels.text.trigger('hover', e);
  },


  /**
   * When the cursor leaves a span.
   *
   * @param {Object} e
   */
  onBurialLeave: function(e) {
    let id = this.getBurialIdFromEvent(e);
    this.channels.burials.trigger('unhighlight', id);
  },


  /**
   * When a span is clicked.
   *
   * @param {Object} e
   */
  onBurialClick: function(e) {
    let id = this.getBurialIdFromEvent(e);
    this.channels.burials.trigger('select', id);
  },


  /**
   * When the cursor enters a section.
   *
   * @param {Object} e
   */
  onSectionEnter: function(e) {

    // Publish the highlight event.
    let slug = this.getSectionSlugFromEvent(e);
    this.channels.sections.trigger('highlight', slug);

    // Is the section focused on the map?
    let focused = this.channels.map.request(
      'sectionFocused', slug
    );

    // If not, flip on click-to-select.
    if (!focused) {
      this.enableSelect(this.getSectionBySlug(slug));
    }

  },


  /**
   * When the cursor leaves a section.
   *
   * @param {Object} e
   */
  onSectionLeave: function(e) {

    // Publish the unhighlight event.
    let slug = this.getSectionSlugFromEvent(e);
    this.channels.sections.trigger('unhighlight', slug);

    // Disable selection.
    this.disableSelect(this.getSectionBySlug(slug));

  },


  // ** Renderers:


  /**
   * Highlight burial spans.
   *
   * @param {Number} id
   */
  highlightBurial: function(id) {
    this.getBurialsById(id).addClass('highlight');
  },


  /**
   * Unhighlight burial spans.
   *
   * @param {Number} id
   */
  unhighlightBurial: function(id) {
    this.getBurialsById(id).removeClass('highlight');
  },


  /**
   * Highlight a section.
   *
   * @param {String} slug
   */
  highlightSection: function(slug) {
    this.getSectionBySlug(slug).addClass('highlight');
  },


  /**
   * Unhighlight a section.
   *
   * @param {String} slug
   */
  unhighlightSection: function(slug) {
    this.getSectionBySlug(slug).removeClass('highlight');
  },


  /**
   * Unhighlight burial spans.
   *
   * @param {String} slug
   */
  selectSection: function(slug) {

    let section = this.getSectionBySlug(slug);

    // Scroll to the section.
    this.$el.animate({
      scrollTop: section[0].offsetTop
    }, {
      duration: styles.duration
    });

  },


  // ** State:


  /**
   * Set a section "unfocused" - click to select, show tooltip.
   *
   * @param {Object} section
   */
  enableSelect: function(section) {

    // Click to select.
    section.click(e => {
      let slug = section.attr('data-slug');
      this.channels.sections.trigger('select', slug);
    });

    // Inject the tooltip.
    this.tip = $(tipTpl()).appendTo('body');

    // TODO
    this.$el.mousemove(e => {
      this.tip.css();
    });

  },


  /**
   * Flip off click-to-select / tooltip.
   *
   * @param {Object} section
   */
  disableSelect: function(section) {
    section.off('click');
    this.tip.remove();
  },


  // ** Helpers:


  /**
   * Get a burial ID from a cursor event.
   *
   * @param {Object} e
   * @returns {Number}
   */
  getBurialIdFromEvent: function(e) {
    return Number($(e.currentTarget).attr('data-id'));
  },


  /**
   * Get a section slug from a cursor event.
   *
   * @param {Object} e
   * @returns {String}
   */
  getSectionSlugFromEvent: function(e) {
    return $(e.currentTarget).attr('data-slug');
  },


  /**
   * Get burial spans by id.
   *
   * @param {Number} id
   * @return {Object}
   */
  getBurialsById: function(id) {
    return this.$(`span.burial[data-id=${id}]`)
  },


  /**
   * Get a section by slug.
   *
   * @param {String} slug
   * @return {Object}
   */
  getSectionBySlug: function(slug) {
    return this.$(`.section[data-slug=${slug}]`);
  },


});
