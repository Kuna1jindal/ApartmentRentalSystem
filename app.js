const mysql=require('mysql');
const port=80;
const express=require('express');
const moment = require('moment');

const currentDate = moment();
console.log(currentDate.format('YYYY-MM-DD'));
const app=express();

const path=require('path');
const { send } = require('process');
const { log, error } = require('console');
const { type } = require('os');
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
//mysql
var con = mysql.createConnection({
    host: "localhost",
    user: "Kunal",
    password: "Ku@2003j",
    database:"rentalsystem"
  });
  let userinput;
  con.connect((err)=> {
    if (err) console.error(err);
    console.log("Connected!");
  });
  //Set up view Engine
  app.use('/static',express.static('static'));
  app.set('view engine','hbs');
  app.set('views',path.join(__dirname,'/views'));

//Sellers Image
let Sellers;
const showseller="select * from owner";
con.query(showseller,[],(error,seller)=>{
    Sellers=seller;

})

  //Get Requests
app.get('/',(req,res)=>{
    const showapartment='select * from apartment';
                  
                       con.query(showapartment,[],(error,answer)=>{
                           
                           res.status(200).render('home', {
                               data:answer,
                               seller:Sellers
                       });
                       })
                    
                   
})
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','login.html'));
})
app.get('/login/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','register.html'));
});

app.get("/resuls",(req,res)=>{
    const o1='select ownerid from owns where apartmentid=?'
                con.query(o1,[19],(error,result)=>{
                    console.log("Owner id Details:",result[0].ownerid);
                     owneremail=result[0].ownerid;});
})

//Global Variables
let buyApartid;
let username;
let useremail;
let userimage;

//multer setup
const multer=require('multer');

const storage=multer.diskStorage({
    destination: function(req,file,cb){
       cb(null,'./static/uploaded_images/');
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + '-' + file.originalname); 
    }
});
const upload=multer({storage})


app.post('/login',(req,res)=>{
   
    let login;
    const {type,name,email,password}=req.body;
     useremail=email;
    if(type=="owner")
    { 
        login = 'select * from owner where email=?';
    }
    else{
        login = 'select * from tenant where email=?';
        
    }
    con.query(login, [email], (error,result) => {
        if(result.length==0) {
            res.send(`<h1>No mail id exist with username:${email}</h1>`);
        }
        else {
            console.log(result);
         username=result[0].name;
         userimage=result[0].imagepath;
        console.log("This is username",username);
            if (result[0].password == password) {
                if(type=="owner")
               { 
                const showapartment='select * from apartment';
                    con.query(showapartment,[],(error,answer)=>{
                        res.status(200).render('owner', {
                            name:result[0].name,
                            data:answer,
                            seller:Sellers,
                            sellerimage:userimage

                    });
                    })
               }
                else{
                    const showapartment='select  a.apartmentid,a.location,a.monthlypayment,a.building,a.apartmentsize,a.imagepath from apartment a where a.apartmentid not in(select apartmentid from rental_agreement)';
                    con.query(showapartment,[],(error,answer)=>{
                        res.status(200).render('tenant', {
                            name:result[0].name,
                            data:answer,
                            imgpath:userimage,
                            seller:Sellers
                    });
                    })
                }
            }
            else {
                res.send('incorrect password');
            }
        }
       
        app.get('/owner',(req,res)=>{
            const showapartment='select * from apartment ';
            con.query(showapartment,[],(error,answer)=>{
                res.status(200).render('owner', {
                    name:username,
                    sellerimage:userimage,
                    data:answer,
                    seller:Sellers
            });
            })
            });
            app.get("/tenants",(req,res)=>{
                const query="Select t.name,t.email,t.age,t.phone_number,t.gender,t.imagepath,r.apartmentid from tenant t,rental_agreement r where t.email=r.tenantid and r.ownerid=?"
                con.query(query,[useremail],(error,result)=>{
                    console.log(result);
                    res.render("tenants",{
                         data:result,
                         name:username
                    })
                })
            })
        app.get('/tenant',(req,res)=>{
            const showapartment='select a.apartmentid,a.location,a.monthlypayment,a.building,a.apartmentsize,a.imagepath from apartment a where a.apartmentid not in(select apartmentid from rental_agreement)';
            con.query(showapartment,[],(error,answer)=>{
                res.status(200).render('tenant', {
                    name:username,
                    data:answer,
                    imgpath:userimage,
                    seller:Sellers
            });
            })
            });
        app.get("/tenantprofile",(req,res)=>{
            console.log(req.body);
            const viewapartment='select a.imagepath, a.location,a.monthlypayment,a.building,a.apartmentsize from apartment a,rental_agreement r, tenant t where a.apartmentid=r.apartmentid and r.tenantid=t.email and t.email=?'
            con.query(viewapartment,[useremail],(error,result)=>{
                   console.log("Tenant Apartments",result);
              res.status(200).render('tenantprofile',{
                apartmentdata:result,
                name:username,
                imgpath:userimage
              });
            });
        });
        app.get('/apartment',(req,res)=>{
            const apartment='select * from apartment natural join owns where ownerid=?'
            con.query(apartment,[useremail],(error,result)=>{

                res.render('apartment',{
                      data:result,
                      username:username
                });
            })
        })
        
        app.get("/addapartment",(req,res)=>{
            res.sendFile(path.join(__dirname,'views','addapartment.html'));
        
                });
        app.post("/delete/apartment",(req,res)=>{
            const {apartmentid}=req.body;
            console.log("This is apartmentid for deleteiobn of apartment",apartmentid);
            const del_owns_aprt_rel='delete from owns where apartmentid=?';
            const deleteapartment='delete from apartment where apartmentid=?';
            const deleteagreement='delete from rental_agreement where apartmentid=?';
            con.query(del_owns_aprt_rel,[apartmentid],(error,result)=>{
                con.query(deleteagreement,[apartmentid],(error,result)=>{
                    con.query(deleteapartment,[apartmentid],(error,result)=>{
                        res.redirect("/apartment");
                    })
                })
            })
        });
        let apartmentsize;
        let location;
        let monthlypayment;
        let owneremail;
        app.post('/buynow',(req,res)=>{
            const {apartment_id}=req.body;
            buyApartid=apartment_id;
            console.log(buyApartid);
            const o1='select ownerid from owns where apartmentid=?'
                con.query(o1,[buyApartid],(error,result)=>{
                    console.log("Owner id Details:",result[0].ownerid);
                     owneremail=result[0].ownerid;});
            const a1='select * from apartment where apartmentid=?';
            con.query(a1,[buyApartid],(error,result)=>{
                 apartmentsize=result[0].apartmentsize;
                 location=result[0].location;
                 monthlypayment=result[0].monthlypayment;
                    res.render("buynow",{
                     apartmentsize:apartmentsize,
                     date_of_join:currentDate.format("YYYY-MM-DD"),
                     name: username,
                     email:useremail,
                     ownerid:owneremail,
                     location:location,
                     monthlypayment:monthlypayment,
                    }); 
                
            })
        });     
        app.post('/actualbuy',(req,res)=>{
            const {outdate}=req.body;
                    const rentalagreement='insert into rental_agreement(ownerid,apartmentid,tenantid,Dateofjoin,Expected_stay_date,monthlyrent) values(?,?,?,?,?,?)'
                    const payment='insert into payment(ownerid,tenantid,Dateofpayment) values(?,?,?)';
                    con.query(payment,[owneremail,useremail,currentDate.format("YYYY-MM-DD")],(error,result)=>{
                        con.query(rentalagreement,[owneremail,buyApartid,useremail,currentDate.format("YYYY-MM-DD"),outdate,monthlypayment],(error,result)=>{
                            res.redirect('/tenantprofile');
                        })
                    })
                })
        app.post("/addapartment",upload.single('imagepath'),(req,res)=>{
            const{location,monthlypayment,building,apartmentsize,imagepath}=req.body;
            const image_name=req.file.filename;
            const imagewholepath="/static/uploaded_images/"+image_name;
            var addaprt='insert into apartment(location,monthlypayment,building,apartmentsize,imagepath) values(?,?,?,?,?)';
            var owns='insert into owns values(?,?)';
            con.query(addaprt,[location,monthlypayment,building,apartmentsize,imagewholepath],(error,result)=>{
                const getapartid='select * from apartment where imagepath=?';
                con.query(getapartid,[imagewholepath],(error,result)=>{
                    con.query(owns,[useremail,result[0].apartmentid],(error,output)=>{
                        console.log("Response Recorded");
                        res.sendFile(path.join(__dirname,"views","response.html"));
                    })
                })
            })
        });
    });
})
app.post('/login/register',upload.single("imagepath"),(req,res)=>{
    let sqlc;
    const image_name=req.file.filename;
    const image_path="/static/uploaded_images/"+image_name;
    const {type,name,email,password,phone_number,age,gender}=req.body;
    if(type=="owner"){
         userinput='insert into owner values(?,?,?,?,?,?,?)';
         sqlc='select * from owner where email=?'
    }
    else{
        userinput='insert into tenant values(?,?,?,?,?,?,?)';
        sqlc='select * from tenant where email=?'
    }
    con.query(sqlc,[email],(error,result)=>{
        if(result.length>0){
            res.send("Email id already exist");
        }
        else{
            console.log(req.body);
            if(req.body.name==''||req.body.email==''||req.body.password==''||req.body.phone_number==''||req.body.age==''||req.body.gender==''){
                res.send("Fields can't be empty!!!");
            }else{
            con.query(userinput,[name,email,password,phone_number,age,gender,image_path],(error,result)=>{
                res.sendFile(path.join(__dirname,"views","registerresponse.html"));

            })}
        }
       
    })
})

app.listen(port,()=>{
    console.log(`listenig at local host port: ${port}`);
})