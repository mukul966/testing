//const connection = require("./dbhelper");
const express = require("express");
const workhelper = require("./workhelper");
const { response } = require("express");
const dayjs=require("dayjs");
const { v4: uuidv4 } = require('uuid');

const router = express();
router.use(express.json());

router.post("/newdetails", async (req, res) => {
    if (!req.body.id) {
      return res.status(200).send({ message: `id missing` });
    }
    const Updatedetail = await workhelper.update_details(req.body, req.body.id);
    return res.send(Updatedetail);
});

router.post('/archive',async (req,res)=>{
    const viewdetail= await workhelper.archive_squad_reqst();
    return response.send(viewdetail);
})

/*router.get('/viewdetails',(req,res)=>{
  connection.query('SELECT * FROM vmsback.squad_request_external where user_id=1',(err,result)=>{
    if(err) throw err;
   // res.send(result);
    //var responsedata=JSON.parse(res)
    res.send({created_at:result[0].created_at})
  })
})*/

router.get('/viewdetailsone',async(req,res)=>{
  const detail=await workhelper.get_squad_request_external_data(2);
  res.send({created_at:detail});
  const date=workhelper.time_difference(detail)
  if(date>=30){

  }
})

router.get('/archive_work',async(req,res)=>{
  const store_work_data=await workhelper.read_work_data(4);
  const add_archive_work_data=await workhelper.add_archive_work_data(store_work_data);
  res.send(add_archive_work_data);
})


router.listen(8000);