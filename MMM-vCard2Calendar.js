Module.register("MMM-vCard2Calendar", {
  defaults: {
    auth: {}
  },
  start: function () {
    this.sendSocketNotification("SET_CONFIG", this.config);
  },
});
