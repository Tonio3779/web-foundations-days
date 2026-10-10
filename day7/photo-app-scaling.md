# Day 7 Assignment: Scaling a Photo-Sharing App (SnapShare)

## 1. Assumptions

SnapShare is a photo-sharing application with 10 million registered users. The system must support photo uploads, feed browsing, and image delivery at scale.

The following assumptions are used for the calculations:

- Total registered users: 10,000,000.
- Daily active users (DAU): 10% of registered users.
- Each daily active user uploads 1 photo per day.
- Each daily active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Average thumbnail size: 50 KB.
- Peak traffic is estimated at 5 times the average traffic.
- A year contains 365 days.
- Decimal storage units are used: 1 MB = 1,000 KB and 1 TB = 1,000,000 MB.
- Each uploaded photo generates one thumbnail.
- Traffic is assumed to be evenly distributed when calculating average request rates.
- Storage estimates represent newly uploaded original photos and thumbnails only. They exclude backups, replicas, metadata, logs, and storage overhead.
- A feed page request is not the same as an individual image request. A single feed page may display multiple images.

## 2. Traffic and Storage Calculations

### A. Daily Active Users

Daily active users are 10% of the total registered users.

DAU = 10,000,000 × 0.10

**DAU = 1,000,000 users per day**

Therefore, SnapShare must support approximately one million daily active users.

### B. Photo Uploads per Day

Each daily active user uploads one photo per day.

Uploads per day = 1,000,000 × 1

**Uploads per day = 1,000,000 photos**

### C. Average Photo Uploads per Second

There are 86,400 seconds in one day.

Average uploads per second = 1,000,000 ÷ 86,400

**Average upload rate ≈ 11.57 uploads per second**

### D. Peak Photo Upload Rate

Peak traffic is estimated at five times the average traffic.

Peak uploads per second = 11.57 × 5

**Peak upload rate ≈ 57.87 uploads per second**

The upload infrastructure should therefore handle approximately 58 uploads per second during peak periods, with additional capacity for unexpected traffic spikes and retries.

### E. Feed Views per Day

Each daily active user views 50 feed pages per day.

Feed views per day = 1,000,000 × 50

**Feed views per day = 50,000,000 feed page requests**

### F. Average Feed Requests per Second

Average feed requests per second = 50,000,000 ÷ 86,400

**Average feed request rate ≈ 578.70 requests per second**

Rounded to a whole number, this is approximately 579 feed requests per second.

### G. Peak Feed Requests per Second

Peak feed requests per second = 578.70 × 5

**Peak feed request rate ≈ 2,893.52 requests per second**

Rounded to a whole number, SnapShare should plan for approximately 2,894 feed requests per second at the assumed peak.

This is the feed API request rate, not the total number of image requests. Since each feed page may contain multiple photos, the CDN and image delivery system may handle substantially more requests.

### H. Annual Original Photo Storage

Daily original photo storage:

1,000,000 photos × 2 MB = 2,000,000 MB per day

Daily original storage = 2,000 GB = 2 TB

Annual original photo storage:

2 TB × 365 days

**Annual original photo storage = 730 TB**

### I. Annual Thumbnail Storage

Daily thumbnail storage:

1,000,000 thumbnails × 50 KB = 50,000,000 KB per day

Daily thumbnail storage = 50,000 MB = 50 GB = 0.05 TB

Annual thumbnail storage:

0.05 TB × 365 days

**Annual thumbnail storage = 18.25 TB**

### J. Total Annual Image Storage

Total annual storage growth:

730 TB of original photos + 18.25 TB of thumbnails

**Total annual image storage growth = 748.25 TB**

This is approximately 0.75 petabytes of additional image storage per year using decimal units.

This estimate excludes backups, replicated copies, metadata, and other operational overhead. Actual provisioned capacity may therefore be higher.

## 3. Workload Classification: Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy application** based on the expected feed and upload workload.

Daily feed page requests = 50,000,000

Daily photo uploads = 1,000,000

Read-to-upload ratio = 50,000,000 ÷ 1,000,000

**Read-to-upload ratio = 50:1**

This means there are approximately 50 feed page requests for every photo upload.

The architecture should therefore prioritize fast feed delivery, caching, efficient database reads, and scalable image delivery.

However, this 50:1 ratio compares feed page requests with uploads; it does not represent every database read and write or every image request. A single feed request can trigger several backend operations, and each uploaded photo may create multiple metadata updates.

## 4. Proposed Scalable Architecture

SnapShare separates application processing, metadata storage, and binary image storage. The design uses horizontal scaling, caching, asynchronous thumbnail generation, and a content delivery network (CDN).

### A. Feed and Image Delivery Architecture

```text
                    +----------------------+
                    |      Mobile/Web      |
                    |        Clients       |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |          CDN         |
                    | Cached Images/Assets |
                    +----+------------+----+
                         |            |
               Cache hit |            | Cache miss
                         |            v
                         |   +----------------------+
                         |   |   Object Storage     |
                         |   | Originals/Thumbnails |
                         |   +----------------------+
                         |
                         v
                    +----------------------+
                    |   Load Balancer      |
                    +----------+-----------+
                               |
                               v
                 +----------------------------+
                 | Horizontally Scaled App    |
                 | Servers / API Instances    |
                 +-------------+--------------+
                               |
                 +-------------+--------------+
                 |                            |
                 v                            v
       +-------------------+       +-------------------+
       | Application Cache |       | Primary Database  |
       | Feed/Hot Metadata |       | Metadata/Writes   |
       +-------------------+       +---------+---------+
                                             |
                                             v
                                  +-------------------+
                                  |   Read Replica    |
                                  |   Feed Queries    |
                                  +-------------------+
```

### B. Photo Upload and Thumbnail Processing Architecture

```text
+------------------+
|  Mobile/Web      |
|  Client          |
+--------+---------+
         |
         v
+--------------------------+
| Load Balancer / App API  |
+------------+-------------+
             |
             | 1. Create photo metadata
             v
+--------------------------+
| Primary Database         |
| status = processing      |
| original object key      |
+--------------------------+
             |
             | 2. Return signed upload URL
             v
+--------------------------+
| Client Uploads Original  |
| Directly to Object       |
| Storage                  |
+------------+-------------+
             |
             | 3. Upload completes
             v
+--------------------------+
| App/API Verifies Upload  |
| and Enqueues Job         |
+------------+-------------+
             |
             v
+--------------------------+
| Message Queue            |
| Photo ID + Object Key    |
| Job Metadata Only        |
+------------+-------------+
             |
             v
+--------------------------+
| Thumbnail Worker         |
| Reads Original Photo     |
| Resizes/Compresses       |
+------------+-------------+
             |
             | 4. Writes thumbnail file
             v
+--------------------------+
| Object Storage           |
| Separate Thumbnail Key   |
+--------------------------+
             |
             | 5. Update metadata
             v
+--------------------------+
| Primary Database         |
| thumbnail key            |
| status = ready           |
+--------------------------+
             |
             | 6. Client retrieves ready URL
             v
+--------------------------+
| App API / Client         |
+------------+-------------+
             |
             v
+--------------------------+
| CDN Serves Thumbnail     |
| Cache Hit or Fetch       |
| from Object Storage      |
+--------------------------+
```

The upload flow is asynchronous after the original photo has been uploaded successfully. The application does not resize the photo synchronously during the upload request. The queue contains job metadata rather than the binary photo itself.

## 5. Explanation of Each Architecture Component

### 1. Mobile/Web Clients

These are the interfaces users use to upload photos, browse feeds, and view images. Clients communicate with the application API for metadata and feed operations and use authorized upload URLs to send original images directly to object storage.

### 2. CDN (Content Delivery Network)

The CDN caches and delivers frequently accessed images from locations closer to users. This reduces image download latency, lowers repeated requests to object storage, and reduces bandwidth and delivery costs.

Original images and thumbnails can have separate caching policies. Private images must be delivered using suitable authorization controls, such as signed URLs or an authenticated image delivery mechanism.

The CDN is a caching and delivery layer; it is not the permanent source of the original image files.

### 3. Load Balancer

The load balancer distributes incoming API requests across multiple application server instances. It helps prevent any one instance from becoming a bottleneck and supports horizontal scaling as traffic increases.

### 4. Horizontally Scaled Application Servers

Multiple application server instances handle authentication, authorization, upload coordination, feed generation, metadata operations, and API responses.

The servers should be stateless where practical so that additional instances can be added without depending on local session or image storage.

### 5. Application Cache

The application cache stores frequently accessed feed data, hot metadata, and other suitable query results. It reduces repeated database reads and improves response times.

Cache invalidation or expiration must be handled carefully when photo metadata changes, a photo is deleted, or access permissions change.

### 6. Primary Database

The primary database stores structured information such as user records, photo IDs, captions, timestamps, privacy settings, original object keys, thumbnail object keys, and processing status.

Writes and important metadata updates go to the primary database. The database stores image references and metadata rather than the full binary image files.

### 7. Read Replica

A read replica serves suitable read-only database queries, such as feed metadata retrieval. It reduces read pressure on the primary database.

Replication may be asynchronous, so a read replica can briefly lag behind the primary database. Operations requiring immediate consistency, such as checking a just-completed upload, should use an appropriate consistency strategy.

### 8. Object Storage

Object storage holds the actual original photos and generated thumbnails. It is designed to store large numbers of files and scale without forcing the relational database to manage the binary contents.

Original photos and thumbnails should use separate object keys or prefixes. For example:

- `originals/{photo_id}`
- `thumbnails/{photo_id}.jpg`

These are illustrative object keys, not public URLs.

The application stores the relevant object keys in the database. Access to private images must be controlled through authorization, signed URLs, or an equivalent secure delivery method.

### 9. Message Queue

The message queue buffers thumbnail-generation jobs and separates photo upload handling from image processing.

A job should contain information such as the photo ID, original object key, and processing options. It should not contain the entire image binary.

This approach allows the application to accept successful uploads without waiting for thumbnail generation. The queue also helps absorb temporary traffic spikes and allows workers to process jobs at their own pace.

### 10. Thumbnail Worker

Thumbnail workers consume jobs from the queue, retrieve original images from object storage, validate and resize them, and compress them to approximately 50 KB where image quality and format permit.

After creating a thumbnail, the worker writes the resulting image to object storage using a separate thumbnail key. It then updates the primary database with that key and changes the photo's processing status to `ready`.

Workers should use retries and idempotent processing where possible. This prevents temporary failures or duplicate queue deliveries from creating inconsistent metadata or unnecessary duplicate outputs.

## 6. Photo Upload and Thumbnail Processing Flow

The following steps describe the complete upload process, including where the thumbnail is stored and how the client receives its URL.

1. **Client starts an upload.** The user selects a photo. The application API authenticates the user, checks upload permissions, validates the request, and creates a unique photo ID.

2. **Create the metadata record.** The application writes a photo record to the primary database. The record contains the photo ID, owner ID, original object key, and a processing status such as `processing`. The thumbnail key is initially empty.

3. **Generate a signed upload URL.** The API returns a short-lived, restricted upload URL so the client can upload the original photo directly to private object storage without routing the entire binary file through the application server.

4. **Upload the original image.** The client uploads the original photo to object storage. The application verifies that the upload completed successfully and checks relevant constraints, such as file type, file size, and ownership.

5. **Enqueue the thumbnail job.** After successful upload verification, the application publishes a job to the message queue. The job contains the photo ID, original object key, and required processing information. It does not contain the binary photo.

6. **Return an accepted response without waiting for processing.** Once the original upload is confirmed and the job has been safely accepted by the queue, the API returns a successful response indicating that the photo was uploaded and thumbnail processing is pending. The API does not wait for the thumbnail worker to finish.

   Example response:

   ```json
   {
     "photo_id": "photo_123",
     "status": "processing",
     "thumbnail_url": null
   }
   ```

7. **Worker retrieves the original.** A background thumbnail worker consumes the job and reads the original image from object storage.

8. **Generate the thumbnail.** The worker validates the image and resizes and compresses it to produce a thumbnail of approximately 50 KB, subject to image content and format.

9. **Store the thumbnail in object storage.** The worker writes the resulting thumbnail to object storage using a separate key, such as `thumbnails/photo_123.jpg`. The thumbnail is stored permanently in object storage rather than only in the cache. The CDN may cache it later when it is requested.

10. **Update the metadata record.** After the thumbnail has been stored successfully, the worker updates the primary database with the thumbnail object key and sets the status to `ready`. The status should not be set to `ready` before the thumbnail is successfully stored.

11. **Make the updated thumbnail URL available to the client.** The client can poll a photo-status endpoint or receive a notification when processing finishes. The API then returns the updated status and a valid thumbnail URL. For private photos, the URL must use the appropriate access controls, such as a short-lived signed URL.

Example response after processing:

```json
{
  "photo_id": "photo_123",
  "status": "ready",
  "thumbnail_url": "https://cdn.example.com/thumbnails/photo_123.jpg"
}
```

The example URL is illustrative. In production, the API would construct or return the actual authorized URL based on the deployment's CDN and access-control configuration.

12. **Deliver the thumbnail through the CDN.** The client displays the thumbnail using the returned URL. If the CDN has a valid cached copy, it serves that copy. On a cache miss, the CDN retrieves the thumbnail from object storage, subject to the configured origin and authorization rules, and may cache it for subsequent requests.

For feed browsing, the API returns authorized photo metadata and suitable image references. Feed data can be served using the application cache and read replica where appropriate, while the CDN delivers the actual image files.

If thumbnail processing fails, the system should retry the job where appropriate and eventually mark the photo as failed or needing retry. The API should not return a thumbnail URL as ready when the thumbnail file is missing.

## 7. Database Design Considerations

The database should store metadata and references, not the full image contents.

A simplified photo record might contain:

- `photo_id`: Unique identifier for the photo.
- `user_id`: ID of the photo owner.
- `caption`: Optional caption.
- `original_object_key`: Reference to the original photo in object storage.
- `thumbnail_object_key`: Reference to the generated thumbnail.
- `status`: Processing state such as `processing`, `ready`, or `failed`.
- `created_at`: Upload creation timestamp.
- `privacy`: Visibility or access-control setting.

Storing approximately 748.25 TB of newly generated image files per year directly inside relational database tables would substantially increase database storage requirements and could negatively affect backups, transaction logs, indexing, and replication.

Keeping binary assets in object storage allows the database to remain focused on structured metadata and transactional operations. This is generally a more scalable design for a photo-sharing application.

## 8. Scaling Strategies

### Horizontal Application Scaling

Add more application server instances behind the load balancer as request volume increases. Use monitoring and autoscaling policies to respond to changes in demand.

### Database Read Scaling

Use read replicas for suitable feed queries and cache frequently accessed metadata. Keep writes on the primary database and account for replication lag.

### CDN and Caching

Cache frequently requested images and suitable feed data. Use appropriate cache-control headers and invalidate or expire cached content when necessary.

Private images require special care: cached content must not be exposed to unauthorized users, and signed URL expiry and CDN caching rules must work together.

### Asynchronous Image Processing

Use a queue and background workers to process thumbnails independently of the main upload request. Scale the worker fleet according to queue depth, job age, and processing latency.

### Object Storage

Store originals and thumbnails separately from database records. Use lifecycle policies where appropriate, while ensuring that retention requirements and user deletion requests are respected.

### Monitoring and Reliability

Monitor upload success rates, feed API latency, error rates, database load, cache hit rates, CDN delivery performance, queue depth, thumbnail processing time, and storage growth.

Use retries with limits, dead-letter handling for repeatedly failing jobs, and idempotent processing to improve reliability.

## 9. Trade-Offs

### Trade-Off 1: Object Storage vs. Database Binary Storage

**Chosen approach: Object storage for image files and a database for metadata.**

Advantages:

- Scales efficiently for large binary assets.
- Keeps database tables and transaction logs smaller.
- Separates image delivery workloads from metadata queries.
- Works well with CDN caching.

Disadvantages:

- Requires coordination between the database and object storage.
- Image retrieval and authorization need additional logic.
- Uploads and metadata updates can fail independently, so cleanup and recovery processes are necessary.

This trade-off is justified because SnapShare is expected to add approximately 748.25 TB of original photos and thumbnails per year before additional overhead.

### Trade-Off 2: Synchronous vs. Asynchronous Thumbnail Processing

**Chosen approach: Asynchronous thumbnail generation using a message queue and background workers.**

Advantages:

- The upload API does not need to wait for image resizing.
- Workers can scale independently from application servers.
- Queues absorb temporary spikes in processing demand.
- Failures can be retried without requiring the user to upload the photo again.

Disadvantages:

- The thumbnail is not immediately available after upload.
- The system needs status tracking, retries, and failure handling.
- The client must poll for status or receive a notification.

This is a reasonable trade-off because users can receive prompt confirmation of a successful upload while the system processes thumbnails in the background.

### Trade-Off 3: Read Replicas vs. Reading Only from the Primary Database

**Chosen approach: Use read replicas for suitable feed queries.**

Advantages:

- Reduces read pressure on the primary database.
- Supports higher volumes of feed metadata queries.
- Separates some read workloads from write workloads.

Disadvantages:

- Replication lag can temporarily produce stale results.
- Additional replicas increase infrastructure and operational costs.
- Not every read can safely use a replica when immediate consistency is required.

This approach fits SnapShare's read-heavy workload, provided that consistency-sensitive operations use the appropriate database endpoint.

## 10. Conclusion

SnapShare has approximately 1 million daily active users, generates 1 million photo uploads per day, and receives 50 million feed page requests per day under the stated assumptions. This corresponds to an average upload rate of approximately 11.57 uploads per second and an average feed request rate of approximately 579 requests per second. At five times average traffic, the system should plan for approximately 58 uploads per second and 2,894 feed requests per second.

The application adds approximately 730 TB of original photos and 18.25 TB of thumbnails per year, for a combined image-storage growth of approximately 748.25 TB before additional overhead.

The proposed architecture uses a CDN, load balancer, horizontally scaled application servers, application cache, primary database, read replica, object storage, a message queue, and background thumbnail workers.

The key design decisions are to keep binary images out of the relational database, optimize feed delivery for reads, and generate thumbnails asynchronously. Thumbnail workers store generated files in object storage, update the database when processing succeeds, and make the thumbnail URL available to the client. The CDN then caches and delivers the thumbnail without replacing object storage as the permanent file store.

Together, these choices provide a practical foundation for scaling SnapShare while balancing performance, reliability, storage growth, and operational complexity.
