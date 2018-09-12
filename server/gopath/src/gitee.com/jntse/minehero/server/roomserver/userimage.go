package main
import (
	"strconv"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/tbl"
	pb "github.com/gogo/protobuf/proto"
)

// --------------------------------------------------------------------------
/// @brief 换装形象
// --------------------------------------------------------------------------
type UserImage struct {
	//female 	map[int32]*msg.ItemData
	//male		map[int32]*msg.ItemData
	clothes 	map[int32]map[int32]*msg.ItemData
	owner   	*RoomUser
}

func (this *UserImage) Init(user *RoomUser) {
	//this.male = make(map[int32]*msg.ItemData)
	//this.female = make(map[int32]*msg.ItemData)
	this.clothes = make(map[int32]map[int32]*msg.ItemData)
	this.clothes[int32(msg.Sex_Female)] = make(map[int32]*msg.ItemData)
	this.clothes[int32(msg.Sex_Male)] = make(map[int32]*msg.ItemData)
	this.owner = user
}

func (this *UserImage) LoadBin(bin *msg.Serialize) {
	for _, image := range bin.GetBase().Images.Lists {
		for _, item := range image.Clothes {
			this.clothes[image.GetSex()][item.GetPos()] = item
		}
	}
}

func (this *UserImage) PackBin(bin *msg.Serialize) {
	bin.Base.Images = &msg.PersonalImage{ Lists:make([]*msg.ImageData,2) }
	bin.Base.Images.Lists[0] = &msg.ImageData{Sex:pb.Int32(int32(msg.Sex_Female))}
	bin.Base.Images.Lists[0].Clothes = make([]*msg.ItemData, 0)

	bin.Base.Images.Lists[1] = &msg.ImageData{Sex:pb.Int32(int32(msg.Sex_Male))}
	bin.Base.Images.Lists[1].Clothes = make([]*msg.ItemData, 0)

	for sex, image := range this.clothes {
		for _, item := range image {
			if sex == int32(msg.Sex_Female) {
				bin.Base.Images.Lists[0].Clothes = append(bin.Base.Images.Lists[0].Clothes, item)
			}else if sex == int32(msg.Sex_Male) {
				bin.Base.Images.Lists[1].Clothes = append(bin.Base.Images.Lists[1].Clothes, item)
			}
		}
	}
}

func (this *UserImage) Clean() {
	this.clothes = make(map[int32]map[int32]*msg.ItemData)
	this.clothes[int32(msg.Sex_Female)] = make(map[int32]*msg.ItemData)
	this.clothes[int32(msg.Sex_Male)] = make(map[int32]*msg.ItemData)

}

func (this *UserImage) GetClothesByPos(pos int32) *msg.ItemData {
	image, find := this.clothes[this.owner.Sex()]
	if find == false {
		return nil
	}

	if item, find := image[pos]; find == true {
		return item
	}

	return nil
}

func (this *UserImage) SendShowImage() {
	send := &msg.GW2C_SendShowImage{ Images:&msg.ImageData{Sex:pb.Int32(this.owner.Sex()), Clothes:make([]*msg.ItemData,0)} }
	if image, find := this.clothes[this.owner.Sex()]; find == true {
		for _, item := range image { send.Images.Clothes = append(send.Images.Clothes, item)  }
	}
	this.owner.SendMsg(send)
}

func (this *UserImage) DressClothes(pos int32, itemid int32) {
	newEquip := this.owner.bag.FindById(uint32(itemid))
	if newEquip == nil {
		this.owner.SendNotify("找不到穿戴的服装")
		return
	}

	equipbase := newEquip.EquipBase()
	if equipbase == nil {
		this.owner.SendNotify("只能穿戴服装道具")
		return 
	}

	if equipbase.Pos != pos {
		this.owner.SendNotify("不能穿戴这个位置")
		return
	}

	if equipbase.Sex != int32(msg.Sex_Neutral) && equipbase.Sex != this.owner.Sex() {
		this.owner.SendNotify("性别不符合")
		return
	}

	copyItem := pb.Clone(newEquip.Bin()).(*msg.ItemData)
	copyItem.Pos = pb.Int32(pos)
	this.clothes[this.owner.Sex()][pos] = copyItem
	this.SendShowImage()
}

// 脱下服装
func (this *UserImage) UnDressClothes(pos int32, syn bool) {
	if clothes := this.GetClothesByPos(pos); clothes == nil {
		return
	}

	delete(this.clothes[this.owner.Sex()], pos)
	if syn { 
		this.SendShowImage() 
	}
}

// 脱下全部
func (this *UserImage) UnDressAll(syn bool) {
	this.clothes[this.owner.Sex()] = make(map[int32]*msg.ItemData)
	if syn { 
		this.SendShowImage() 
	}
}


//
func (this *UserImage) IsHaveDressSuit() bool {
	clothes := this.clothes[this.owner.Sex()]
	for _, v := range clothes {
		if v.GetPos() == int32(msg.ItemPos_Suit) {
			return true 
		}
	}
	return false
}

func (this *UserImage) GetEquipSkills() []int32 {
	clothes, find := this.clothes[this.owner.Sex()]
	if find == false {
		return nil
	}

	skills := make([]int32, 0, 10)
	for _, item := range clothes {
		equip, find := tbl.TEquipBase.EquipById[int32(item.GetId())]
		if find == false { continue }
		for _, skill := range equip.Skill { 
			iskill, _ := strconv.ParseInt(skill, 10, 32)
			skills = append(skills, int32(iskill))
		}
	}

	return skills
}


