import { MongoClient } from "mongodb";
import password from "./password.js";
import data from "./data.js";
const uri = `mongodb+srv://thiagoAndo:${password}@cluster0.owrb9s4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

//==============================================================================

// async function getDocument(collection) {
//   try {
//     const database = client.db("ProductFeedback");
//     const feedback = database.collection(collection);
//     const users =  await feedback.find().toArray();
//     console.log(users);
//   } catch (error) {
//     console.log(error);
//     return;
//   }
// }
// getDocument("user");

// async function deleteDocument() {
//   try {
//     const database = client.db("ProductFeedback");
//     await database.collection("user").deleteMany({});
//     await database.collection("productRequests").deleteMany({});
//     await database.collection("comments").deleteMany({});
//     await database.collection("replies").deleteMany({});
//   } catch (error) {
//     console.log(error);
//     return;
//   }
// }
// deleteDocument();
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

const user = {
  ...data.currentUser,
};

insertDocument(user, "user");

data.productRequests.forEach((request) => {
  insertDocument(
    {
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
      const user = {
        ...comment.user,
      };

      if (typeof comment === "object") {
        insertDocument(user, "user");

        insertDocument(
          {
            productRequests_id: request.id,
            usernam: comment.user.username,
            id: comment.id,
            content: comment.content,
          },
          "comments"
        );
      }

      if (comment?.replies) {
        comment.replies.forEach((replie) => {
          const user = {
            ...replie.user,
          };
          insertDocument(user, "user");

          insertDocument(
            {
              content: replie.content,
              replyingTo: replie.replyingTo,
              username: replie.user.username,
              comment_id: comment.id,
            },
            "replies"
          );
        });
      }
    });
  }
});
