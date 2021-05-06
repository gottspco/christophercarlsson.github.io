let version = 4;
let vueselect = Vue.component('vue-multiselect', window.VueMultiselect.default)

var vm = new Vue({
  el: ".container-fluid",

  data: {
    group: null,
    groupName: null,
    groups: [],
    trades: [],
    tags: [],

    chart: null,
    maxDrawDown: 0,
    maxReturn: 0,
    averageReturn: 0,
    showStats: false,
    showFilters: false,
    risk: null,
    money: null,
    tradeNotes: null,
    currentEditTrade: null,
    newPair: null,
    newSetup: null,

    filteredPairs: [],
    filteredDirections: [],
    filteredTypes: [],
    filteredSetups: [],
    filteredDays: [],
    filteredHours: [],
    filteredResults: [],
    filteredTags: [],
    filteredStartDate: null,
    filteredEndDate: null,

    resultOptions: ['Win', 'Break even', 'Loss'],
    daysOptions: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hoursOptions: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],

    date: null,
    pair: null,
    direction: null,
    type: null,
    setup: null,
    entry: null,
    stop: null,
    profit: null,
    result: [{pips: null, closed: null}],
    notes: null,
    before: null,
    after: null,
    tradeTags: [],

    pairs: [
      "AUDCAD",
      "AUDCHF",
      "AUDJPY",
      "AUDNZD",
      "AUDUSD",
      "CADCHF",
      "CADJPY",
      "CHFJPY",
      "EURAUD",
      "EURCAD",
      "EURCHF",
      "EURGBP",
      "EURNZD",
      "EURUSD",
      "EURJPY",
      "GBPAUD",
      "GBPCAD",
      "GBPCHF",
      "GBPJPY",
      "GBPNZD",
      "GBPUSD",
      "NZDCAD",
      "NZDCHF",
      "NZDJPY",
      "NZDUSD",
      "USDCAD",
      "USDCHF",
      "USDJPY",
    ],
    customPairs: [],
    disabledPairs: [],

    directions: [
      "Long",
      "Short",
    ],

    types: [
      "Continuation",
      "Reversal"
    ],

    setups: [
      "Break & retest",
      "Pause & go",
      "Double top",
      "Double bottom",
      "Tripple top",
      "Tripple bottom",
      "Deep pullback",
      "BOBBI"
    ],
    customSetups: [],
    disabledSetups: [],

    darkmode: false,
  },

  watch: {
    darkmode: function (val) {
      localStorage.setItem('darkmode', val ? 1 : 0);
      Vue.nextTick(function () {
        vm.setDarkmodeOnBody();
      });
    },

    list: function() {
      vm.setupChart();
    }
  },

  created: function () {
    this.migrate();

    if (localStorage.getItem("trades") != null) {
      this.trades = JSON.parse(localStorage.getItem("trades"));
    }

    if (localStorage.getItem("groups") != null) {
      this.groups = JSON.parse(localStorage.getItem("groups"));
    }

    if (localStorage.getItem("custom-pairs") != null) {
      this.customPairs = JSON.parse(localStorage.getItem("custom-pairs"));
      this.pairs.push(...this.customPairs);
    }

    if (localStorage.getItem("disabled-pairs") != null) {
      this.disabledPairs = JSON.parse(localStorage.getItem("disabled-pairs"));
    }

    if (localStorage.getItem("custom-setups") != null) {
      this.customSetups = JSON.parse(localStorage.getItem("custom-setups"));
      this.setups.push(...this.customSetups);
    }

    if (localStorage.getItem("disabled-setups") != null) {
      this.disabledSetups = JSON.parse(localStorage.getItem("disabled-setups"));
    }

    if (localStorage.getItem("darkmode") != null) {
      this.darkmode = localStorage.getItem("darkmode") == 1;
    }

    if (localStorage.getItem("tags") != null) {
      this.tags = JSON.parse(localStorage.getItem("tags"));
    }

    document.onkeypress = function (e) {
        e = e || window.event;
        if (e.keyCode == 13) vm.addTrade();
    };

    $(document).ready(() => {
      vm.setupChart();

      $(document).find('.cpop').popover({
        trigger: 'hover'
      });

      $('#edit-modal').on('hidden.bs.modal', function (e) {
        vm.currentEditTrade.result = vm.currentEditTrade.result.map((tp) => {
          tp.closed = tp.closed / 100;
          tp.r = (tp.pips / vm.currentEditTrade.stop) * tp.closed;
          return tp;
        });
        vm.currentEditTrade.r = vm.rResult(vm.currentEditTrade.result);
        vm.currentEditTrade.pips = vm.pipResult(vm.currentEditTrade.result);
        localStorage.setItem("trades", JSON.stringify(vm.trades));
        vm.setupChart();
      });

      document.getElementById('restoreBackup').addEventListener('change', function() { 
        let reader = new FileReader(); 
        reader.onload = function() { 
          let result = reader.result;
          let json = JSON.parse(result);

          if (json.hasOwnProperty('customPairs') && json.hasOwnProperty('disabledPairs') &&
              json.hasOwnProperty('customSetups') && json.hasOwnProperty('disabledSetups')) {
            localStorage.setItem('custom-pairs', JSON.stringify(json.customPairs));
            localStorage.setItem('disabled-pairs', JSON.stringify(json.disabledPairs));
            localStorage.setItem('custom-setups', JSON.stringify(json.customSetups));
            localStorage.setItem('disabled-setups', JSON.stringify(json.disabledSetups));

            Vue.set(vm, 'customPairs', json.customPairs);
            Vue.set(vm, 'disabledPairs', json.disabledPairs);
            Vue.set(vm, 'customSetups', json.customSetups);
            Vue.set(vm, 'disabledSetups', json.disabledSetups);
          }

          if (json.hasOwnProperty('tags')) {
            localStorage.setItem('tags', JSON.stringify(json.tags));
          }

          if (json.hasOwnProperty('version')) {
            localStorage.setItem("version", json.version);
          }

          if (json.hasOwnProperty('trades') && json.hasOwnProperty('groups')) {
            localStorage.setItem('trades', JSON.stringify(json.trades));
            localStorage.setItem('groups', JSON.stringify(json.groups));

            Vue.set(vm, 'trades', json.trades);
            Vue.set(vm, 'groups', json.groups);
          }

          alert('Successfully imported your data.');
          location.reload();
        }
        reader.readAsText(this.files[0]); 
      }); 

    });
  },

  components: {
    vueselect
  },

  computed: {
    list: function() {
      if (this.group == null) {
        return [];
      }
      return this.trades.filter((trade) => {
        if (trade.group != this.group) {
          return false;
        }

        if (!_.isEmpty(this.filteredPairs) && !this.filteredPairs.includes(trade.pair)) {
          return false;
        }

        if (!_.isEmpty(this.filteredDirections) && !this.filteredDirections.includes(trade.direction)) {
          return false;
        }

        if (!_.isEmpty(this.filteredTypes) && !this.filteredTypes.includes(trade.type)) {
          return false;
        }

        if (!_.isEmpty(this.filteredSetups) && !this.filteredSetups.includes(trade.setup)) {
          return false;
        }

        if (!_.isEmpty(this.filteredResults)) {
          if (trade.r > 0 && !this.filteredResults.includes('Win')) return false;
          if (0 > trade.r > -0.45 && !this.filteredResults.includes('Break even')) return false;
          if (trade.r < 0 && !this.filteredResults.includes('Loss')) return false;
        }

        let tradeDate = moment(trade.date);
        let tradeDay = tradeDate.format('dddd');
        if (!_.isEmpty(this.filteredDays) && !this.filteredDays.includes(tradeDay)) {
          return false;
        }

        let tradeHour = tradeDate.format('HH');
        if (!_.isEmpty(this.filteredHours) && !this.filteredHours.includes(tradeHour)) {
          return false;
        }

        if (!_.isEmpty(this.filteredStartDate) && tradeDate.isBefore(moment(this.filteredStartDate))) {
          return false;
        }

        if (!_.isEmpty(this.filteredEndDate) && tradeDate.isAfter(moment(this.filteredEndDate))) {
          return false;
        }

        if (!_.isEmpty(this.filteredTags)) {
          return this.filteredTags.filter((tag) => {
            let tradeTags = [];
            if (trade.tags) {
              tradeTags.push(...trade.tags.map((tag) => tag.name));
            }
            return tradeTags.includes(tag)
          }).length > 0;
        }

        return true;
      }).sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      });
    },

    bestPairs: function() {
      return this.statistics(this.pairs, 'pair', true);
    },

    bestDirections: function() {
      return this.statistics(this.directions, 'direction', false);
    },

    bestTypes: function() {
      return this.statistics(this.types, 'type', false);
    },

    bestSetups: function() {
      return this.statistics(this.setups, 'setup', true);
    },

    bestHours: function() {
      let grouped = _.groupBy(this.list, (trade) => {
        return moment(trade.date).format('HH');
      });

      var result = [];
      for (var prop in grouped) {
        result.push({
          name: prop,
          total: grouped[prop].length,
          win: grouped[prop].filter((trade) => trade.r > 0).length,
          be: grouped[prop].filter((trade) => trade.r == 0).length,
          loss: grouped[prop].filter((trade) => trade.r < 0).length,
          r: _.round(grouped[prop].reduce((total, trade) => total + trade.r, 0), 2)
        });
      }

      return result.sort((a, b) => this.sort(a, b));
    },

    bestDay: function() {
      let grouped = _.groupBy(this.list, (trade) => {
        return moment(trade.date).format('dddd');
      });

      var result = [];
      for (var prop in grouped) {
        result.push({
          name: prop,
          total: grouped[prop].length,
          win: grouped[prop].filter((trade) => trade.r > 0).length,
          be: grouped[prop].filter((trade) => trade.r == 0).length,
          loss: grouped[prop].filter((trade) => trade.r < 0).length,
          r: _.round(grouped[prop].reduce((total, trade) => total + trade.r, 0), 2)
        });
      }

      return result.sort((a, b) => this.sort(a, b));
    },

    bestDay: function() {
      let grouped = _.groupBy(this.list, (trade) => {
        return moment(trade.date).format('dddd');
      });

      var result = [];
      for (var prop in grouped) {
        result.push({
          name: prop,
          total: grouped[prop].length,
          win: grouped[prop].filter((trade) => trade.r > 0).length,
          be: grouped[prop].filter((trade) => trade.r == 0).length,
          loss: grouped[prop].filter((trade) => trade.r < 0).length,
          r: _.round(grouped[prop].reduce((total, trade) => total + trade.r, 0), 2)
        });
      }

      return result.sort((a, b) => this.sort(a, b));
    },

    generalStats: function() {
      return [
        {
          name: "R",
          value: this.r
        },
        {
          name: "Account balance",
          value: this.money ? ((this.r * (this.risk / 100)) * this.money) + parseInt(this.money) : 0
        }
      ]
    },

    win: function () {
      return this.list.filter((trade) => trade.r >= 0).length;
    },

    r: function() {
      return _.round(this.list.reduce((total, trade) => total + trade.r, 0), 2)
    },

    activeFilters: function() {
      let filters = [...this.filteredPairs, ...this.filteredDirections, ...this.filteredTypes, ...this.filteredSetups, ...this.filteredDays, ...this.filteredHours, ...this.filteredResults, ...this.filteredTags];
      if (this.filteredStartDate != null) {
        filters.push('Start Date');
      }
      if (this.filteredEndDate != null) {
        filters.push('End Date');
      }
      return filters;
    },

    enabledPairs: function() {
      return this.pairs.filter((pair) => !this.disabledPairs.includes(pair));
    },

    enabledSetups: function() {
      return this.setups.filter((setup) => !this.disabledSetups.includes(setup));
    }
  },

  methods: {
    setupChart: function() {
      if (this.chart != null) {
        this.chart.destroy();
      }

      const labels = this.list.map((trade) => trade.date).reverse();
      labels.unshift('Start');
      const dataset = [0];

      let previousR = 0;
      this.list.slice().reverse().forEach((trade) => {
        const sum = _.round(previousR + trade.r, 2);
        dataset.push(sum);
        previousR = sum;
      });

      this.maxDrawDown = Math.min(_.min(dataset), 0);
      this.maxReturn = Math.max(_.max(dataset), 0);
      this.averageReturn = dataset.length > 0 ? _.round(dataset.reduce((acc, el, index) => (acc + el) / (index + 1)), 2) : 0;

      this.chart = new Chart(document.getElementById('progress').getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{ 
              data: dataset,
              borderColor: "#3e95cd",
              fill: false,
              pointRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
              tension: 0.2
            }
          },
          scales: {
            xAxes: [{
              display: false
            }],
            yAxes: [{
              gridLines: {
                color: "#eeeeee"
              }
            }]
          },
          title: {
            display: false
          },
          legend: {
            display: false,
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                return tooltipItem.value + 'R';
              },
            }
          }
        }
      });
    },

    openSettings: function() {
      $(`#settings-modal`).modal('show');
    },

    addTrade: function() {
      if (_.isEmpty(this.date)) {
        alert("Must enter a date");
        return;
      }

      if (_.isEmpty(this.pair)) {
        alert("Must enter a pair");
        return;
      }
      
      if (_.isEmpty(this.direction)) {
        alert("Must enter a direction");
        return;
      }

      if (_.isEmpty(this.type)) {
        alert("Must enter a type");
        return;
      }

      if (_.isEmpty(this.setup)) {
        alert("Must enter a setup");
        return;
      }

      if (_.isEmpty(this.entry) || !$.isNumeric(this.entry)) {
        alert("Must enter a valid entry price");
        return;
      }

      if (_.isEmpty(this.stop) || !$.isNumeric(this.stop)) {
        alert("Must enter a valid stop loss");
        return;
      }

      if (_.isEmpty(this.profit) || !$.isNumeric(this.profit)) {
        alert("Must enter a valid take profit");
        return;
      }

      if (_.isEmpty(this.result)) {
        alert("Must enter a take profit");
        return;
      }

      let percentage = 100;
      for (let i = 0; i < this.result.length; i++) {
        if (this.result[i].pips == null || !$.isNumeric(this.result[i].pips)) {
          alert("Must enter a valid TP pip value");
          return;
        }

        if (this.result[i].closed == null || !$.isNumeric(this.result[i].closed)) {
          alert("Must enter a valid TP closed % value");
          return;
        }

        percentage -= this.result[i].closed;
      }

      if (percentage != 0) {
        alert("Closed TP % must equal 100%.");
        return;
      }

      let tpResult = [];
      for (let i = 0; i < this.result.length; i++) {
        const tp = this.result[i];
        const closed = tp.closed / 100;
        const pips = tp.pips;
        const r = (pips / this.stop) * closed;
        tpResult.push({
          closed: closed,
          pips: pips,
          r: r
        });
      }

      this.trades.push({
        id: this.id(),
        group: this.group,
        date: this.date,
        pair: this.pair,
        direction: this.direction,
        type: this.type,
        setup: this.setup,
        entry: this.entry,
        stop: this.stop,
        profit: this.profit,
        result: tpResult,
        r: this.rResult(tpResult),
        pips: this.pipResult(tpResult),
        notes: this.notes,
        before: this.before,
        after: this.after,
        tags: this.tradeTags,
        editing: false
      });

      this.direction  = null;
      this.type  = null;
      this.setup  = null;
      this.entry = null;
      this.stop = null;
      this.profit = null;
      this.result = [{pips: null, closed: null}];
      this.notes = null;
      this.before = null;
      this.after = null;
      this.tradeTags = [];
      
      localStorage.setItem("trades", JSON.stringify(this.trades));
    },

    addGroup: function() {
      if (_.isEmpty(this.groupName)) {
        alert("Must enter a group name.");
        return;
      }

      if (this.groups.includes(this.groupName)) {
        alert("Name must be unique.");
        return;
      }

      this.groups.push(this.groupName);
      this.group = this.groupName;
      this.groupName = null;
      localStorage.setItem("groups", JSON.stringify(this.groups));
    },

    deleteTrade: function(tradeId) {
      if (confirm('Do you really want to remove this trade?')) {
        this.trades = this.trades.filter((trade) => tradeId != trade.id);
        localStorage.setItem("trades", JSON.stringify(this.trades));
      }
    },

    deleteGroup: function(groupName) {
      if (confirm('Do you really want to remove this session?')) {
        this.groups = this.groups.filter((group) => groupName != group);
        localStorage.setItem("groups", JSON.stringify(this.groups));
        this.group = null;
      }
    },

    editTrade: function(index, trade) {
      Vue.set(vm, 'currentEditTrade', trade);

      Vue.set(vm.currentEditTrade, 'result', this.currentEditTrade.result.map((tp) => {
        tp.closed = tp.closed * 100;
        return tp;
      }));

      $(`#edit-modal`).modal('show');
    },

    showNotes: function(notes) {
      this.tradeNotes = notes;
      $(`#note-modal`).modal('show');
    },

    togglePair: function(pair) {
      const index = this.disabledPairs.indexOf(pair);
      if (index > -1) {
        this.disabledPairs.splice(index, 1);
      } else {
        this.disabledPairs.push(pair);
      }

      localStorage.setItem("disabled-pairs", JSON.stringify(this.disabledPairs));
    },

    toggleSetup: function(setup) {
      const index = this.disabledSetups.indexOf(setup);
      if (index > -1) {
        this.disabledSetups.splice(index, 1);
      } else {
        this.disabledSetups.push(setup);
      }

      localStorage.setItem("disabled-setups", JSON.stringify(this.disabledSetups));
    },

    addPair: function() {
      if (_.isEmpty(this.newPair) || this.customPairs.includes(this.newPair)) {
        return;
      }

      this.customPairs.push(this.newPair);
      this.pairs.push(this.newPair);
      this.newPair = null;
      localStorage.setItem("custom-pairs", JSON.stringify(this.customPairs));
    },

    removePair: function(pair) {
      const customIndex = this.customPairs.indexOf(pair);
      if (customIndex > -1) {
        this.customPairs.splice(customIndex, 1);
      }

      const index = this.pairs.indexOf(pair);
      if (index > -1) {
        this.pairs.splice(index, 1);
      }

      localStorage.setItem("custom-pairs", JSON.stringify(this.customPairs));
    },

    addSetup: function() {
      if (_.isEmpty(this.newSetup) || this.customSetups.includes(this.newSetup)) {
        return;
      }

      this.customSetups.push(this.newSetup);
      this.setups.push(this.newSetup);
      this.newSetup = null;
      localStorage.setItem("custom-setups", JSON.stringify(this.customSetups));
    },

    removeSetup: function(setup) {
      const customIndex = this.customSetups.indexOf(setup);
      if (customIndex > -1) {
        this.customSetups.splice(customIndex, 1);
      }

      const index = this.setups.indexOf(setup);
      if (index > -1) {
        this.setups.splice(index, 1);
      }

      localStorage.setItem("custom-setups", JSON.stringify(this.customSetups));
    },

    statistics: function(array, property, noZeros) {
      return array.map((prop) => {
        return {
          name: prop,
          total: this.list.filter((trade) => trade[property] == prop).length,
          win: this.list.filter((trade) => trade[property] == prop && trade.r > 0).length,
          be: this.list.filter((trade) => trade[property] == prop && trade.r == 0).length,
          loss: this.list.filter((trade) => trade[property] == prop && trade.r < 0).length,
          r: _.round(this.list.filter((trade) => trade[property] == prop).reduce((total, trade) => total + trade.r, 0), 2)
        };
      }).filter((row) => {
        if (noZeros) {
          return row.total != 0;
        }
        return true;
      }).sort((a, b) => this.sort(a, b));
    },

    sort: function(a, b) {
      if (a.r < b.r) return 1;
      if (a.r > b.r) return -1;
      return 0;
    },

    pipResult: function(tps) {
      return tps.map((tp) => tp.pips);
    },

    rResult: function (tps) {
      return _.round(tps.reduce((total, tp) => total + parseFloat(tp.r), 0), 2);
    },

    percent: function(num, tot) {
      return _.round(((num / tot) * 100) || 0, 2);
    },

    id: function() {
      let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let length = 8;
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
      return result;
    },

    migrate: function() {
      if (localStorage.getItem("version") == null) {
        localStorage.setItem("version", version);
      }

      let oldVersion = localStorage.getItem("version");
      if (oldVersion == version) {
        return;
      }

      // Execute migrations here
      this.multipleTakeProfitMigration();

      localStorage.setItem("version", version);
    },

    setDarkmodeOnBody: function() {
      if ($(".container-fluid").hasClass("dark-mode")) {
        $("body").addClass('dark-mode');
      } else {
        $("body").removeClass('dark-mode');
      }
    },

    backup: function() {
      this.download('positions.json', JSON.stringify({
        'trades': this.trades,
        'groups': this.groups,
        'customPairs': this.customPairs,
        'disabledPairs': this.disabledPairs,
        'customSetups': this.customSetups,
        'disabledSetups': this.disabledSetups,
        'tags': this.tags,
        'version': version
      }));
    },

    restore: function() {
      $('#restoreBackup').click();
    },

    excel: function() {
      const headers = 'date;pair;direction;setup;type;entry;profit;stop;result;r;before;after;\r\n'
      const trades = headers + this.list.map((trade) => `${trade.date};${trade.pair};${trade.direction};${trade.setup};${trade.type};${trade.entry};${trade.profit};${trade.stop};${trade.result};${_.round(trade.result / trade.stop, 2)};${_.defaultTo(trade.before, '')};${_.defaultTo(trade.after, '')};\r\n`).join('');
      const result = trades.substring(0, trades.length - 4);
      this.download(`trade-export_${moment().format('yyyy-MM-DD')}.csv`, result, 'text/csv');
    },

    download: function(filename, text, data = 'text/plain') {
      var element = document.createElement('a');
      element.setAttribute('href', `data:${data};charset=utf-8,` + encodeURIComponent(text));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    },

    multipleTakeProfitMigration: function() {
      let trades = JSON.parse(localStorage.getItem("trades"));
      if (trades.length > 0 && Array.isArray(trades[0].result)) {
        return;
      }

      trades = trades.map((trade) => {
        const tempTakeProfit = trade.result;
        trade.result = [{
          closed: 100,
          pips: tempTakeProfit,
          r: _.round(tempTakeProfit / trade.stop, 2)
        }];
        trade.r = this.rResult(trade.result);
        trade.pips = this.pipResult(trade.result);
        
        return trade;
      });
      localStorage.setItem('trades', JSON.stringify(trades));
    },

    addTag: function(newTag) {
      const tag = {
        name: newTag,
        code: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
      }
      this.tradeTags.push(tag)
      this.tags.push(tag)
      localStorage.setItem('tags', JSON.stringify(this.tags));
    },
  }
});
