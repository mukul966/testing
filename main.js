//const connection = require("./dbhelper");
const express = require("express");
const workhelper = require("./workhelper");
const { response } = require("express");
const dayjs = require("dayjs");
const { v4: uuidv4 } = require("uuid");

const router = express();
router.use(express.json());

router.post("/newdetails", async (req, res) => {
  if (!req.body.id) {
    return res.status(200).send({ message: `id missing` });
  }
  
  const Updatedetail = await workhelper.update_details(req.body, req.body.id);
  
  if(Updatedetail.hasOwnProperty('error')){
    return res.status(200).send({message:`Error in Update`})
  }
  return res.send(Updatedetail);
});


router.post("/updateSquad", async (req, res) => {
  if (!req.body.squad_id) {
    return res.status(200).send({ message: `squad_id missing` });
  }
  
  const Updatesquaddetail = await workhelper.update_squad_details(req.body, req.body.squad_id);
  
  if(Updatesquaddetail.hasOwnProperty('error')){
    return res.status(200).send({message:`Error While Updating`})
  }
  return res.send(Updatesquaddetail);
});



router.post("/archive", async (req, res) => {
  const viewdetail = await workhelper.archive_squad_reqst();
  return response.send(viewdetail);
});

/*router.get('/viewdetails',(req,res)=>{
  connection.query('SELECT * FROM vmsback.squad_request_external where user_id=1',(err,result)=>{
    if(err) throw err;
   // res.send(result);
    //var responsedata=JSON.parse(res)
    res.send({created_at:result[0].created_at})
  })
})*/

router.get("/viewdetailsone", async (req, res) => {
  const detail = await workhelper.get_squad_request_external_data(2);
  res.send({ created_at: detail });
  const date = workhelper.time_difference(detail);
  if (date >= 30) {
  }
});

router.get("/archive_work", async (req, res) => {
  const store_work_data = await workhelper.read_work_data(5);
  const add_archive_work_data = await workhelper.add_archive_work_data(
    store_work_data
  );

  res.send(add_archive_work_data);
});

router.post("/createSquadWorkClient", async (req, res) => {
  if (!req.body.work_id || !req.body.main_squad_id || !req.body.client_squad_id) {
    return res.status(200).send({ message: `Mandatory field(s):'work_id','main_squad_id','client_squad_id'` });
  } 
 
  var data = req.body;
  const newSquadWork = await workhelper.createSquadWorkClient(data);
  
  if (newSquadWork.hasOwnProperty('error')) {
		return res.status(500).send({ error: newSquadWork.error });
	}

	return res.send(newSquadWork);

});

router.post("/updateSquadWorkClient", async (req, res) => {
  if (!req.body.work_client_id) {
    return res.status(200).send({ message: `work_client_id missing` });
  }

  const updateSquadWork = await workhelper.updateSquadWorkClient(
    req.body,
    req.body.work_client_id
  );
  
  if(updateSquadWork.hasOwnProperty('error')){
    return res.status(500).send({error:updateSquadWork.error})
  }

  return res.send(updateSquadWork);
  
});

router.post("/viewSquadClientImg",async(req,res)=>{
  if(!req.body.squad_id){
    return res.status(200).send({message:'squad_id_missing'})
  }

  const viewProfile=await workhelper.viewSquadClientImg(req.body.squad_id);
  return res.send(viewProfile)
})



router.post("/viewAllProjects",async(req,res)=>
{
  if(!req.body.squad_id)
  {
    return res.status(200).send({message:`squad_id missing`})
  }
  
  const view=await workhelper.viewAllProjects(req.body.squad_id);

  if(view.hasOwnProperty('error'))
  {
    return res.status(500).send({error:view.error})
  }
  return res.send(view);
})




router.post("/allWorkResource",async(req,res)=>
{
  if(!req.body.work_id)
  {
    return res.status(200).send({message:'work_id missing'})
  }
  
  const viewResource=await workhelper.getAllWorkResources(req.body.work_id);

  if(viewResource.hasOwnProperty('error'))
  {
    return res.status(500).send({error:viewResource.error})
  }
  return res.send(viewResource);
})

router.post("/viewAllClients", async(req,res)=>{
  if(!req.body.main_squad_id)
  {
    return res.status(200).send({message:'main_squad_id missing'})
  }
  
  const viewClients= await workhelper.viewSquadClients(req.body.main_squad_id)

  if(viewClients.hasOwnProperty('error'))
  {
    return res.status(500).send({error:viewClients.error})

  }
  return res.send(viewClients)

})

router.listen(8000);
