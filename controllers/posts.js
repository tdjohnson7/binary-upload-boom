const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Company = require("../models/Company");
const Customer = require("../models/Customer");
const Product = require("../models/Product")


module.exports = {
  getCustomerProfile: async (req, res) => {
    try {
      console.log("req.user", req.user)
      const posts = await Customer.find({ user: req.user.id });
     
      res.render("customerProfile.ejs", { products: [{title: "product1"}, {title: "product2"}, {title: "product3"}], companies: [{companyName: "company1"}, {companyName: "company2"}, {companyName: "company3"}], posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getCompanyProfile: async (req, res) => {
    try {
      const products = await Product.find({ companyName: req.user.id });
      console.log("getCompanyProfile see req.user.id", req.user.id)
     
      res.render("companyProfile.ejs", { products: products, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const companies = await Company.find()
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts, user: req.user, companies: companies });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" }).lean();
      res.render("post.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  rateProduct: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
  addComment: async (req, res) => {
    try {
      

      await Comment.create({
        
        post: req.params.id,
        comment: req.body.comment,
        likes: 0,
      });
      console.log("comment has been added!");
      res.redirect(`/post/` + req.params.id);
    } catch (err) {
      console.log(err);
    }
  },
};
