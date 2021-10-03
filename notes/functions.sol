// Elements:
//	EVENT
//	DONATION
//	PERFORMANCE
// Actors:
//	CHARITY
//	DONER
//	PARTICIPANT

contract FunRun {
    function createEvent(uint eventTime) returns (uint) {
        // EVENT is created (and owned) by a CHARITY to take place at a certain time.
    }

    function cancelEvent(uint event) returns (bool) isOwner() {
        // EVENTS can be cancelled by their creating CHARITY.
    }

    function viewParticipants(uint event) public returns (address[]) {
        // Anyone can view the PARTICIPANTS in a given EVENT.
    }

    function viewPerformance(uint event, address participant) public returns (bool) {
        // Anyone can view the PERFORMANCE of a PARTICIPANT in an EVENT.
    }

    function viewDoners(uint event, address participant) public returns (address[]) {
        // Anyone can view the DONERS for a PARTICIPANT in an EVENT.
    }

    function donate(uint event, address participant) public payable returns (bool){
        // Anyone can be a DONER for a PARTICIPANT in an EVENT.
        // Amount will come from `msg.value`.
    }

    function participate(uint event) public returns (bool) {
        // Anyone can sign up to participate in an EVENT.
    }

    function recordPerformance(uint event, address participant) returns (bool) {
        // PERFORMANCE data of a PARTICIPANT is pulled from an oracle.
    }

    function reconcile() private returns (bool) {
        // After the event time, PERFORMANCES are evaluated against DONATIONS.
        // Payouts are made to the CHARITY.
    }
}





