DebuggerHelper = {
    getDebuggerSidebar:function () {
        return Ext.getCmp("rightSidebar");
    },

    /* Renders an individual output command opcode into a string. */
    commandToString:function (obj) {
        var opcode = obj.opcode;
        var params = obj.params;

        var res = "";
        res += opcode + "(";
        for (var i in params) {
            if (params.hasOwnProperty(i))
                var val = params[i];
            if (i == "view") {
                val = "<view>"
            }
            res += i + "=" + val + ",";
        }
        res = res.substr(0, res.length - 1);
        res += ")";
        return res;
    },

    /* Renders an input command opcode's parameters into a string, suppressing the opcode. */
    inputCommandParamsToString:function (params) {
        var res = "";
        for (var i in params) {
            if (params.hasOwnProperty(i))
                var val = params[i];
            if (i != "view" && i != "name") {
                res += i + "=" + val + "\n";
            }
        }
        res = res.substr(0, res.length - 1);
        return res;
    },

    nextStep:function (steps) {
        API.nextStep({
            steps:steps,
            success:function (response) {
                /* Helps to test the functionality.
                var fake = JSON.parse('{"id":333,"name":"Fake","master":true,"input":{"params":{"name":"Slave","time":"112","view":"????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????WW?????????????????????????????W__????????????????????????????W___????????????????????????????____????????????????????????????____????????????????????????????__b_????????????????????????????__b_WWW?????????????????????????_____W?????????????????????????W__M_W?????????????????????????WWWW_W??????????????????????????????P???????????????????????????????_???????????????????????????????_???????????????????????????????_???????????????????????????????_???????????????????????????????_???????????????????????????????_???????????????????????????????_???????????????????????????????_???????????????????????????????W????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????","energy":"1800"},"opcode":"React"},"output":[{"params":{"dx":"1","dy":"1"},"opcode":"Move"}],"debugOutput":""}')
                response.entities.push(fake);
                */
                Sandbox.setState(response);
            },

            failure:function (response) {
                ErrorConsole.show({
                    messages:[
                        { line:0, message:response.responseText, severity:0 }
                    ],
                    errorCount:1,
                    warningCount:0
                });
            }
        });
    },

    createStepAction:function (name, steps) {
        return {
            text:name,
            handler:function (c) {
                DebuggerHelper.nextStep(steps);
            },

            handlePlayback:function (e) {
                this.setDisabled(e.running);
            },

            listeners:{
                afterrender:function () {
                    Events.on("playback", this.handlePlayback, this);
                },

                destroy:function () {
                    Events.un("playback", this.handlePlayback, this);
                }
            }
        };
    },

    createRestartAction:function () {
        return {
            text: "Restart",

            afterDestroy: function() {
                API.createSandbox({
                    jsonData:{
                        config: {
                            "-x":"50",
                            "-y":"50",
                            "-perimeter":"open",
                            "-walls":"20",
                            "-snorgs":"20",
                            "-fluppets":"20",
                            "-toxifera":"20",
                            "-zugars":"20"
                        }
                    },
                    success:function () {
                        DebuggerHelper.nextStep(1);
                    }
                });
            },

            handler:function (c) {
                API.destroySandboxes({
                    failure: this.afterDestroy,
                    success: this.afterDestroy
                });
            },

            handlePlayback:function (e) {
                this.setDisabled(e.running);
            },

            listeners:{
                afterrender:function () {
                    Events.on("playback", this.handlePlayback, this);
                },

                destroy:function () {
                    Events.un("playback", this.handlePlayback, this);
                }
            }
        };
    },

    showError:function (response) {
        ErrorConsole.show({
            messages:[
                { line:0, message:response.responseText, severity:0 }
            ],
            errorCount:1,
            warningCount:0
        });
    },


    createTextPane:function (param) {
        return {
            id: param.id,
            xtype:"panel",
            layout:"fit",
            //margin:3,
            border: 0,
            flex: param.flex || 2,
            tbar:[ param.title ],
            items:[
                {
                    xtype:"textarea",
                    disabled: false,
                    listeners:{
                        afterrender:function () {
                            Events.on("entitySelectionChanged", param.updateHandler, this);
                        },

                        destroy:function () {
                            Events.un("entitySelectionChanged", param.updateHandler, this);
                        }
                    }
                }
            ]
        };
    }
};