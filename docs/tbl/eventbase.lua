// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var Event : table.IEventDefine[] = [
		{ Id : 1, Event : 1001 	}
	]


// Id
export var EventById : game.Dictionary<table.IEventDefine> = {}
function readEventById(){
  for(let rec of Event) {
    EventById[rec.Id] = rec; 
  }
}
readEventById();
}
