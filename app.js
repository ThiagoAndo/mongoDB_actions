import { MongoClient } from "mongodb";
import uniqid from "uniqid";
import password from "./password.js";
import data from "./data.js";
const uri = `mongodb+srv://thiagoAndo:${password}@cluster0.owrb9s4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

//==============================================================================

async function insertDocument(data, collection) {
  try {
    const database = client.db("ProductFeedback");
    const feedback = database.collection(collection);
    await feedback.insertOne(data);
  } catch (error) {
    console.log(error);
    return;
  }
}

const firstID = uniqid()

const user = {
  id: firstID,
  ...data.currentUser,
};

insertDocument(user, "user");

data.productRequests.forEach((request) => {
  insertDocument(
    {
      user_id: firstID,
      id: request.id,
      title: request.title,
      category: request.category,
      upvotes: request.upvotes,
      status: request.status,
      description: request.description,
    },
    "productRequests"
  );
  if (request?.comments) {
    request.comments.forEach((comment) => {
      const user_id = uniqid();
      const user = {
        id: user_id,
        ...comment.user,
      };

      if (typeof comment === "object") {
        insertDocument(user, "user");

        insertDocument(
          {
            productRequests_id: request.id,
            user_id: user_id,
            id: comment.id,
            content: comment.content,
          },
          "comments"
        );
      }

      if (comment?.replies) {
        comment.replies.forEach((replie) => {
          const user_id = uniqid();
          const user = {
            id: user_id,
            ...replie.user,
          };
insertDocument(user, "user");


          insertDocument(
            {
              content: replie.content,
              replyingTo: replie.replyingTo,
              user_id: user_id,
            },
            "replies"
          );
        });
      }
    });
  }
});


