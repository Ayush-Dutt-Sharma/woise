import mongoose,{Schema, models} from 'mongoose'

const ActiveJobsSchema = new Schema(
    {
        name:{
          type:String,
          required:true
        },
        email: {
          type: String,
          required: true,
        },
        currentStatus: {
          type: String,
          required: true,
        },
        jobID: {
          type: String,
          required: true,
        }, 
        image: {
          type: String,
          required: true,
        },
        ytUrl:{
          type:String,
          required:true
        },
        ytThumb:{
          type:String,
          required:true
        },
        videoTitle:{
          type:String,
          required:true
        },
        voice:{
          type:String,
          required:true
        },
        s3Link:{
          type:String
        },
        

    }
      ,
      { timestamps: true }

)
ActiveJobsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const ActiveJobs = models.ActiveJobs || mongoose.model('ActiveJobs',ActiveJobsSchema)
export default ActiveJobs