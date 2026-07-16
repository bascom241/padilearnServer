import mongoose, {Schema} from "mongoose";


 const courseSchema = new Schema ({
    title: {
        type:String, 
        required: [true, "title is required"]
    }, 
    description: {
        title: String,
        required: [true,  "description is required"]
    }, 
    thumbnail: {
        title: String, 
        required: [true, "thumbnail"]
    },
    instructor: {
        type:Schema.Types.ObjectId, 
        ref:"User", 
        required: [true, "Instructor is required"]
    }, 
    category:{
        type:Schema.Types.ObjectId, 
        ref:"CourseCategory", 
        required: [true, "Category is required"]
    }, 
    price: {
        type: Number,
        required: [true, "price is required"] 
    }, 
    isPublished: {
        type: Boolean, 
        default: false
    }
}, {timestamps: true});


export default mongoose.model("Course", courseSchema);
