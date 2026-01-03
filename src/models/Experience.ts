import { getDatabase } from "@/lib/mongodb";
import { Experience } from "./types";
import { Collection, ObjectId, WithId, Document } from "mongodb";

const COLLECTION_NAME = "experiences";

// Helper function to map MongoDB document to Experience type
const mapDocumentToExperience = (doc: WithId<Document>): Experience => ({
  _id: doc._id.toString(),
  title: doc.title,
  context: doc.context,
  date: doc.date,
  description: doc.description,
  details: doc.details,
  article: doc.article,
  techStack: doc.techStack,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export class ExperienceModel {
  private static async getCollection(): Promise<Collection> {
    const db = await getDatabase();
    return db.collection(COLLECTION_NAME);
  }

  static async findAll(): Promise<Experience[]> {
    const collection = await this.getCollection();
    const experiences = await collection.find({}).toArray();
    return experiences.map(mapDocumentToExperience);
  }

  static async findById(id: string): Promise<Experience | null> {
    const collection = await this.getCollection();
    const experience = await collection.findOne({ _id: new ObjectId(id) });
    return experience ? mapDocumentToExperience(experience) : null;
  }

  static async create(
    experienceData: Omit<Experience, "_id" | "createdAt" | "updatedAt">
  ): Promise<Experience> {
    const collection = await this.getCollection();
    const now = new Date();

    const result = await collection.insertOne({
      ...experienceData,
      createdAt: now,
      updatedAt: now,
    });

    return {
      _id: result.insertedId.toString(),
      ...experienceData,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async update(
    id: string,
    updates: Partial<Omit<Experience, "_id" | "createdAt">>
  ): Promise<Experience | null> {
    const collection = await this.getCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result ? mapDocumentToExperience(result) : null;
  }

  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
