# Day 7 Assignment: Scaling a Photo-Sharing App

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and view feeds from people they follow.

The following assumptions are used:

- Registered users: 10,000,000.
- Daily active users: 10% of registered users.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Each photo has one thumbnail of 50 KB.
- One day has 86,400 seconds.
- One year has 365 days.
- Peak traffic is estimated at 5 times the average feed-view rate.
- All uploaded photos are retained for at least one year.
- Storage calculations use decimal units: 1 MB = 1,000 KB and 1 TB = 1,000 GB.
- Traffic is assumed to be evenly distributed throughout the day when calculating averages.
- Storage estimates exclude backups, replication overhead, metadata, and other application data.

## 2. Daily Active Users

Daily active users (DAU) are the number of registered users who use the application each day.

DAU = Registered users × Daily active percentage

DAU = 10,000,000 × 0.10

**Daily active users = 1,000,000 users.**

## 3. Traffic and Storage Calculations

### A. Photo Uploads per Second

Each active user uploads one photo per day.

Daily uploads = 1,000,000 × 1

Daily uploads = 1,000,000 photos.

Average uploads per second:

1,000,000 ÷ 86,400 = 11.57

**Average upload rate = approximately 11.6 photos per second.**

### B. Feed Views per Second

Each active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

Daily feed views = 50,000,000.

Average feed views per second:

50,000,000 ÷ 86,400 = 578.70

**Average feed view rate = approximately 579 requests per second.**

Peak feed views per second:

578.70 × 5 = 2,893.52

**Peak feed view rate = approximately 2,894 requests per second.**

The system should be designed to handle approximately 2,900 feed requests per second at peak, with additional capacity for unexpected traffic spikes.

### C. Photo Storage per Year

Each original photo is 2 MB.

Daily original photo storage:

1,000,000 × 2 MB = 2,000,000 MB

This equals approximately 2,000 GB or 2 TB per day.

Annual original photo storage:

2 TB × 365 = 730 TB

**Original photo storage per year = 730 TB.**

Each thumbnail is 50 KB, equivalent to 0.05 MB.

Daily thumbnail storage:

1,000,000 × 0.05 MB = 50,000 MB = 50 GB

Annual thumbnail storage:

50 GB × 365 = 18,250 GB

**Thumbnail storage per year = 18.25 TB.**

Total annual photo storage:

730 TB + 18.25 TB = 748.25 TB

**Total estimated storage per year = 748.25 TB, approximately 0.75 PB.**

This is the additional storage required for one year of uploads. If SnapShare retains all historical photos, its storage requirements will continue to grow annually.

### Summary of Estimates

| Metric                          |   Estimate |
| ------------------------------- | ---------: |
| Registered users                | 10 million |
| Daily active users              |  1 million |
| Photo uploads per day           |  1 million |
| Average uploads per second      |       11.6 |
| Feed views per day              | 50 million |
| Average feed views per second   |        579 |
| Peak feed views per second      |      2,894 |
| Original photo storage per year |     730 TB |
| Thumbnail storage per year      |   18.25 TB |
| Total photo storage per year    |  748.25 TB |

## 4. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view approximately 50 million feed pages per day but upload only one million photos per day.

The feed-view count is 50 times the upload count. Therefore, the architecture should prioritize fast reads, caching, CDN delivery, and database read scaling.

Uploads must remain reliable, but photo processing can be separated from the upload request using a message queue and background workers.

## 5. Why Photos Should Not Be Stored Inside the Database

Original photos and thumbnails should be stored in object storage rather than directly inside the database.

At an estimated 748.25 TB of new photo and thumbnail data per year, storing image files inside the database would increase database size, backup time, replication traffic, and maintenance costs.

Object storage is designed to handle large volumes of files with scalable capacity and durable storage. The database should store metadata such as photo IDs, user IDs, object-storage keys, captions, timestamps, and visibility settings.

## 6. SnapShare Architecture Diagram

                         USERS
                           |
               +-----------+-----------+
               |                       |
               v                       v
          PHOTO UPLOADS            FEED REQUESTS
               |                       |
               |                       v
               |                 +-----------+
               |                 |    CDN    |
               |                 +-----------+
               |                       |
               |                 Cached photos
               |                       |
               |                       v
               |                 +-----------+
               |                 |   Load    |
               |                 | Balancer  |
               |                 +-----------+
               |                       |
               |                       v
               |                 +-----------+
               |                 | App Server|
               |                 |  Cluster  |
               |                 +-----------+
               |                       |
               |              +--------+--------+
               |              |                 |
               |              v                 v
               |        +-----------+     +-----------+
               |        |   Cache   |     |  Primary  |
               |        |           |     | Database  |
               |        +-----------+     +-----------+
               |                                |
               |                                v
               |                          +-----------+
               |                          |   Read    |
               |                          |  Replica  |
               |                          +-----------+
               |
               v
       +------------------+
       |  Object Storage  |
       |  Original Photos|
       +------------------+
               |
               v
       +------------------+
       |   Message Queue  |
       +------------------+
               |
               v
       +------------------+
       | Thumbnail Worker |
       +------------------+
               |
               v
       +------------------+
       | Thumbnail Object |
       |     Storage      |
       +------------------+
               |
               v
       Update photo metadata
       and mark thumbnail ready

The CDN delivers cached photos and thumbnails directly to users. Dynamic feed requests pass through the load balancer to the application servers. The application servers use the cache and database to retrieve feed metadata. Database writes go to the primary database, while suitable read queries can use the read replica.

The upload path stores original files in object storage and sends thumbnail-generation jobs to a queue for asynchronous processing.

## 7. Explanation of Each Component

1. **CDN:** Caches and delivers photos and thumbnails close to users, reducing latency and repeated requests to the origin.
2. **Load balancer:** Distributes incoming requests across healthy application servers to prevent individual servers from becoming overloaded.
3. **App servers:** Handle authentication, upload authorization, feed generation, photo metadata, and application logic.
4. **Cache:** Stores frequently requested feed data and metadata to reduce database queries and improve response times.
5. **Primary database:** Stores authoritative records such as users, follows, photo metadata, captions, and permissions.
6. **Database read replica:** Handles suitable read queries to reduce the primary database's read workload, although replication lag may occur.
7. **Object storage:** Stores original photos and generated thumbnails without filling the database with large binary files.
8. **Message queue:** Holds thumbnail-generation jobs so they can be processed asynchronously and retried after temporary failures.
9. **Thumbnail worker:** Retrieves queued jobs, generates thumbnails from original photos, and uploads the resulting files to object storage.

## 8. Step-by-Step Photo Upload Flow

1. A user selects a photo and submits an upload request through the SnapShare application.
2. The application server authenticates the user, checks upload permissions, and validates the file type and size.
3. The application creates a photo record in the primary database with a unique photo ID and a status such as `processing`.
4. The application authorizes the client to upload the original photo directly to object storage using a secure, time-limited upload URL.
5. The client uploads the original photo to object storage, and the application verifies that the upload completed successfully.
6. The application publishes a thumbnail-generation job to the message queue containing the photo ID and original object's storage key.
7. A thumbnail worker retrieves the job and downloads the original photo from object storage.
8. The worker generates a thumbnail targeting approximately 50 KB, uploads it to object storage, and records its storage key in the primary database.
9. The application marks the thumbnail as ready and makes the photo available according to the user's visibility settings.
10. When other users view the photo, the CDN delivers cached image content where available and retrieves uncached content from object storage.

The queue and worker should support retries and idempotent processing to prevent temporary failures from permanently losing jobs or creating inconsistent results. Repeated failures should be moved to a dead-letter queue for investigation.

## 9. Scaling Trade-Offs

### Trade-Off 1: CDN Caching vs. Freshness and Privacy

A CDN reduces latency, origin traffic, and bandwidth costs by caching frequently viewed photos. However, cached images can become stale after a photo is changed or deleted. Private photos also require access controls to prevent unauthorized access.

SnapShare can use cache-control policies, versioned image URLs, cache invalidation, and signed URLs for private content.

### Trade-Off 2: Read Replicas vs. Consistency

Read replicas distribute read traffic and reduce pressure on the primary database. However, updates written to the primary database may take time to appear on a replica.

For example, a newly uploaded photo might not immediately appear in a query served by a lagging replica. SnapShare can direct read-after-write requests to the primary database and use replicas for less time-sensitive reads.

### Trade-Off 3: Asynchronous Thumbnail Processing vs. Immediate Availability

A message queue and background workers keep uploads responsive and allow image processing to scale independently. However, thumbnails may not be available immediately, and the queue can grow when workers cannot keep up with incoming jobs.

SnapShare can monitor queue depth, scale workers automatically, retry failed jobs, and show placeholders while thumbnails are being generated.

### Trade-Off 4: Direct Object Uploads vs. Operational Complexity

Uploading directly to object storage reduces application-server bandwidth and processing load. However, it adds complexity involving signed URLs, permissions, upload verification, and incomplete uploads.

SnapShare should use short-lived, restricted upload URLs and verify upload completion before making a photo visible.

## 10. Conclusion

SnapShare has one million daily active users, approximately 11.6 photo uploads per second on average, 579 feed views per second on average, and an estimated peak of 2,894 feed views per second.

It generates approximately 748.25 TB of new original-photo and thumbnail data annually under the stated assumptions.

Because SnapShare is read-heavy, its architecture should prioritize CDN delivery, caching, scalable application servers, and database read replicas. Object storage should hold image files, while the database stores metadata and relationships. A message queue and thumbnail workers keep image processing asynchronous and scalable.

This architecture allows each component to scale independently as the number of users and photos grows.
