import mongoose,{Schema, models} from 'mongoose'

const TodaySongsSchema = new Schema(
    {
        name:{
          type:String,
          required:true
        },
        image:{
          type:String,
          required:true
        },
        email: {
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
TodaySongsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const TodaySongs = models.TodaySongs || mongoose.model('TodaySongs',TodaySongsSchema)
export default TodaySongs