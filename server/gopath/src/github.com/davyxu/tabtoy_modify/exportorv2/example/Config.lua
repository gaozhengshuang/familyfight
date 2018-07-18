-- Generated by github.com/davyxu/tabtoy
-- Version: 2.8.5

local tab = {
	Sample = {
		{ ID = 100, Name = "黑猫警长", NumericalRate = 0.6, ItemID = 100, BuffID = { 0, 10 }, Pos = { X= 100, Y= 89 }, Type = 0, SkillID = { 4, 6, 7 }, AttackParam = { Value= 1 }, SingleStruct = { HP= 100, AttackRate= 1.2 }, StrStruct = { { HP= 3, ExType= 0 }, { HP= 10, ExType= 1 } } 	},
		{ ID = 101, Name = "葫芦\n娃", NumericalRate = 0.8, ItemID = 100, BuffID = { 3, 1 }, Type = 2, SkillID = { 1 }, SingleStruct = { HP= 10 }, StrStruct = { { HP= 10 } } 	},
		{ ID = 102, Name = "舒\"克\"", NumericalRate = 0.7, ItemID = 100, BuffID = { 0, 0 }, Type = 3, SkillID = {  }, SingleStruct = { HP= 10 }, StrStruct = { { HP= 10 } } 	},
		{ ID = 103, Name = "贝\n塔", ItemID = 100, BuffID = { 0, 0 }, Type = 1, SkillID = {  }, SingleStruct = { HP= 10 }, StrStruct = { { HP= 10 } } 	},
		{ ID = 104, Name = "邋遢大王", NumericalRate = 1, ItemID = 100, BuffID = { 0, 0 }, Type = 2, SkillID = {  }, SingleStruct = { HP= 10 }, StrStruct = { { HP= 10 } } 	}
	}, 

	Vertical = {
		{ ServerIP = "192.168.0.1", DebugMode = true, ClientLimit = 3000, Peer = { Name= "Agent", Type= "Acceptor" }, Float = 0.5, Token = { 1, 2, 3 } 	}
	}, 

	Exp = {
		{ Level = 1, Exp = 10, BoolChecker = false, Type = 3 	},
		{ Level = 2, Exp = 30 	},
		{ Level = 4, BoolChecker = false 	},
		{ Level = 5, Type = 1 	},
		{ Level = 6, Exp = 50 	},
		{ Level = 7, Exp = 70, Type = 2 	},
		{ Level = 8, Exp = 80 	}
	}

}


-- ID
tab.SampleByID = {}
for _, rec in pairs(tab.Sample) do
	tab.SampleByID[rec.ID] = rec
end

-- Name
tab.SampleByName = {}
for _, rec in pairs(tab.Sample) do
	tab.SampleByName[rec.Name] = rec
end

-- Level
tab.ExpByLevel = {}
for _, rec in pairs(tab.Exp) do
	tab.ExpByLevel[rec.Level] = rec
end

tab.Enum = {
}

return tab