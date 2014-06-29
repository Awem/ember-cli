'use strict';
/*jshint expr: true*/

var expect        = require('chai').expect;
var lookupCommand = require('../../../lib/cli/lookup-command');
var Command       = require('../../../lib/models/command');
var Project       = require('../../../lib/models/project');
var MockUI        = require('../../helpers/mock-ui');
var AddonCommand  = require('../../fixtures/addon/commands/addon-command');

var commands = {
  serve: Command.extend({
    name: 'serve',
    aliases: ['s'],
    works: 'everywhere',
    availableOptions: [
      { name: 'port', key: 'port', type: Number, default: 4200, required: true }
    ],
    run: function() {}
  })
};

describe('cli/lookup-command.js', function() {
  var ui;

  before(function(){
    ui = new MockUI();
  });

  it('lookupCommand() should find commands by name and aliases.', function() {
    // Valid commands

    expect(lookupCommand(commands, 'serve')).to.exist;
    expect(lookupCommand(commands, 's')).to.exist;
  });

  it('lookupCommand() should find commands that addons add by name and aliases.', function() {
    var command, Command;
    var project = {
      isEmberCLIProject: function(){ return true; },
      initializeAddons: function() {
        this.addons = [new AddonCommand()];
      },
      addonCommands: function() {
        return Project.prototype.addonCommands.call(this);
      }
    };

    Command = lookupCommand(commands, 'addon-command', [], project);
    command = new Command({
      ui: ui,
      project: project
    });

    expect(command.name).to.equal('addon-command');

    Command = lookupCommand(commands, 'ac', [], project);
    command = new Command({
      ui: ui,
      project: project
    });

    expect(command.name).to.equal('addon-command');
  });

  it('lookupCommand() should return UnknownCommand object when command name is not present.', function() {
    var Command = lookupCommand(commands, 'something-else');
    var command = new Command({
      ui: ui,
      project: { isEmberCLIProject: function(){ return true; }}
    });
    command.validateAndRun([]);
    expect(ui.output).to.match(/command.*something-else.*is invalid/);
  });
});
