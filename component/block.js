'use strict';
polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  errorMessage: '',
  running: false,
  actions: {
    retryLookup: function () {
      this.set('running', true);
      this.set('errorMessage', '');
      const payload = {
        entity: this.get('block.entity')
      };
      this.sendIntegrationMessage(payload)
        .then((result) => {
          this.set('block.data', result.data);
        })
        .catch((err) => {
          // there was an error
          this.set('errorMessage', JSON.stringify(err, null, 4));
        })
        .finally(() => {
          this.set('running', false);
        });
    }
  }
});
