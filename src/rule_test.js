"use strict";
var Rule = require('./rule.js');
var Money = require('./money.js');
var SetRateRule = require('./events/SetRateRule.js');
var Park = require('./commands/Park.js')

var vancouverRule = new SetRateRule( {
    SetRateRule: {
        lotRange: "1000-2000",
        rates: [
            {
                name: "Everyday",
                timeRange: "Mon-Sun, 0900h-2200h",
                ratePerHour: 2,
                granularity: "minutes",
                limitStayInHours: 2,
                limitResetInMins: 30
            }
        ],
        restrictions: [
            {
                name: "Morning Rush Hour",
                timeRange: "Mon-Fri, 0700h-1000h"
            },
            {
                name: "Evening Rush Hour",
                timeRange: "Mon-Fri, 1500h-1800h"
            }
        ]
    }
});

module.exports = {
    'Test Parking Sunny Path' : function(test) {
        var rule = new Rule();

        // GIVEN: a parking spot is setup
        rule.hydrate(vancouverRule.SetRateRule);

        // WHEN: a user asks to park
        var parkingChargeApprovedEvent = rule.execute( {
            ParkCommand: {
                version: "1.0.0",
                previousParking: null,
                spot: 1234,
                startTime: "Jan 7, 2016 2210h",
                durationInMinutes: 40
            }
        });

        // THEN: the appropriate charge is calculated
        var expectedMoneyRoundedToPennies = new Money(40.0/60.0*2.0);
        console.log("money test " + expectedMoneyRoundedToPennies);
        var actual = parkingChargeApprovedEvent.totalCharge;
        test.expect(1);
        test.ok(actual === expectedMoneyRoundedToPennies,
            "rate should be " + expectedMoneyRoundedToPennies + " but was " + actual);
        test.done();
    },
    'Test Parking During Rush Hour' : function(test) {
        var rule = new Rule();

        // GIVEN: a parking spot is setup
        rule.hydrate(vancouverRule.SetRateRule);

        // WHEN: a user asks to park
        var parkingChargeApprovedEvent = rule.execute( {
            ParkCommand: {
                version: "1.0.0",
                previousParking: null,
                spot: 1234,
                start: "Jan 7, 2016 1430h",
                durationInMinutes: 60
            }
        });

        // THEN: an error message is received
        var expectedMoneyRoundedToPennies = new Money(40.0/60.0*2.0);
        console.log("money test " + expectedMoneyRoundedToPennies);
        var actual = parkingChargeApprovedEvent.totalCharge;
        test.expect(1);
        test.ok(actual === expectedMoneyRoundedToPennies,
            "rate should be " + expectedMoneyRoundedToPennies + " but was " + actual);
        test.done();
    }
}