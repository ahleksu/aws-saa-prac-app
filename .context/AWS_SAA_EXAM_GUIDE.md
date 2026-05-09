

# AWS Certified Solutions Architect - Associate (SAA-C03)
<a name="solutions-architect-associate-03"></a>

The AWS Certified Solutions Architect - Associate (SAA-C03) exam is intended for individuals who perform a solutions architect role. The exam validates a candidate's ability to design solutions based on the AWS Well-Architected Framework.

**Topics**
+ [Introduction](#solutions-architect-associate-03-intro)
+ [Target candidate description](#solutions-architect-associate-03-target)
+ [Exam content](#solutions-architect-associate-03-exam-content)
+ [Content outline](#solutions-architect-associate-03-domains)
+ [Service References](#saa-service-references)
+ [Content Domain 1: Design Secure Architectures](solutions-architect-associate-03-domain1.md)
+ [Content Domain 2: Design Resilient Architectures](solutions-architect-associate-03-domain2.md)
+ [Content Domain 3: Design High-Performing Architectures](solutions-architect-associate-03-domain3.md)
+ [Content Domain 4: Design Cost-Optimized Architectures](solutions-architect-associate-03-domain4.md)
+ [Technologies and Concepts](saa-technologies-concepts.md)
+ [Mentions of AWS Services on the Exam](saa-service-mentions.md)
+ [In-Scope AWS Services](saa-03-in-scope-services.md)
+ [Out-of-Scope AWS Services](saa-03-out-of-scope-services.md)
+ [Survey](#solutions-architect-associate-03-survey)

## Introduction
<a name="solutions-architect-associate-03-intro"></a>

The [AWS Certified Solutions Architect - Associate (SAA-C03)](https://aws.amazon.com/certification/certified-solutions-architect-associate/) exam is intended for individuals who perform a solutions architect role. The exam validates a candidate's ability to design solutions based on the AWS Well-Architected Framework.

The exam also validates a candidate's ability to complete the following tasks:
+ Design solutions that incorporate AWS services to meet current business requirements and future projected needs
+ Design architectures that are secure, resilient, high-performing, and cost-optimized
+ Review existing solutions and determine improvements

## Target candidate description
<a name="solutions-architect-associate-03-target"></a>

The target candidate should have at least 1 year of hands-on experience designing cloud solutions that use AWS services.

## Exam content
<a name="solutions-architect-associate-03-exam-content"></a>

### Response types
<a name="solutions-architect-associate-03-response-types"></a>

There are two types of questions on the exam:
+ **Multiple choice:** Has one correct response and three incorrect responses (distractors)
+ **Multiple response:** Has two or more correct responses out of five or more response options

Select one or more responses that best complete the statement or answer the question. Distractors, or incorrect answers, are response options that a candidate with incomplete knowledge or skill might choose. Distractors are generally plausible responses that match the content area.

Unanswered questions are scored as incorrect; there is no penalty for guessing. The exam includes 50 questions that affect your score.

### Unscored content
<a name="solutions-architect-associate-03-unscored-content"></a>

The exam includes 15 unscored questions that do not affect your score. AWS collects information about performance on these unscored questions to evaluate these questions for future use as scored questions. These unscored questions are not identified on the exam.

### Exam results
<a name="solutions-architect-associate-03-exam-results"></a>

The AWS Certified Solutions Architect - Associate (SAA-C03) exam has a pass or fail designation. The exam is scored against a minimum standard established by AWS professionals who follow certification industry best practices and guidelines.

Your results for the exam are reported as a scaled score of 100–1,000. The minimum passing score is 720. Your score shows how you performed on the exam as a whole and whether you passed. Scaled scoring models help equate scores across multiple exam forms that might have slightly different difficulty levels.

Your score report could contain a table of classifications of your performance at each section level. The exam uses a compensatory scoring model, which means that you do not need to achieve a passing score in each section. You need to pass only the overall exam.

Each section of the exam has a specific weighting, so some sections have more questions than other sections have. The table of classifications contains general information that highlights your strengths and weaknesses. Use caution when you interpret section-level feedback.

## Content outline
<a name="solutions-architect-associate-03-domains"></a>

This exam guide includes weightings, content domains, and task statements for the exam. This guide does not provide a comprehensive list of the content on the exam. However, additional context for each task statement is available to help you prepare for the exam.

The exam has the following content domains and weightings:
+ [Content Domain 1: Design Secure Architectures (30% of scored content)](solutions-architect-associate-03-domain1.md)
+ [Content Domain 2: Design Resilient Architectures (26% of scored content)](solutions-architect-associate-03-domain2.md)
+ [Content Domain 3: Design High-Performing Architectures (24% of scored content)](solutions-architect-associate-03-domain3.md)
+ [Content Domain 4: Design Cost-Optimized Architectures (20% of scored content)](solutions-architect-associate-03-domain4.md)

## Service References
<a name="saa-service-references"></a>

The following sections provide detailed information about AWS services, technologies, and concepts relevant to this certification exam:
+ [Technologies and Concepts](saa-technologies-concepts.md)
+ [Mentions of AWS Services on the Exam](saa-service-mentions.md)
+ [In-Scope AWS Services](saa-03-in-scope-services.md)
+ [Out-of-Scope AWS Services](saa-03-out-of-scope-services.md)

## Survey
<a name="solutions-architect-associate-03-survey"></a>

How useful was this exam guide? Let us know by [taking our survey](https://amazonmr.au1.qualtrics.com/jfe/form/SV_8vLR1a9uG9zu9Po?course_title=SAA-Associate&course_id=SAA-C03&Q_Language=EN).



# Content Domain 1: Design Secure Architectures
<a name="solutions-architect-associate-03-domain1"></a>

**Topics**
+ [Task 1.1: Design secure access to AWS resources](#solutions-architect-associate-03-domain1-task1)
+ [Task 1.2: Design secure workloads and applications](#solutions-architect-associate-03-domain1-task2)
+ [Task 1.3: Determine appropriate data security controls](#solutions-architect-associate-03-domain1-task3)

## Task 1.1: Design secure access to AWS resources
<a name="solutions-architect-associate-03-domain1-task1"></a>

Knowledge of:
+ Access controls and management across multiple accounts
+ AWS federated access and identity services (for example, IAM, AWS IAM Identity Center)
+ AWS global infrastructure (for example, Availability Zones, AWS Regions)
+ AWS security best practices (for example, the principle of least privilege)
+ The AWS shared responsibility model

Skills in:
+ Applying AWS security best practices to IAM users and root users (for example, multi-factor authentication [MFA])
+ Designing a flexible authorization model that includes IAM users, groups, roles, and policies
+ Designing a role-based access control strategy (for example, AWS STS, role switching, cross-account access)
+ Designing a security strategy for multiple AWS accounts (for example, AWS Control Tower, service control policies [SCPs])
+ Determining the appropriate use of resource policies for AWS services
+ Determining when to federate a directory service with IAM roles

## Task 1.2: Design secure workloads and applications
<a name="solutions-architect-associate-03-domain1-task2"></a>

Knowledge of:
+ Application configuration and credentials security
+ AWS service endpoints
+ Control ports, protocols, and network traffic on AWS
+ Secure application access
+ Security services with appropriate use cases (for example, AWS Cognito, AWS GuardDuty, AWS Macie)
+ Threat vectors external to AWS (for example, DDoS, SQL injection)

Skills in:
+ Designing VPC architectures with security components (for example, security groups, route tables, network ACLs, NAT gateways)
+ Determining network segmentation strategies (for example, using public subnets and private subnets)
+ Integrating AWS services to secure applications (for example, AWS Shield, AWS WAF, IAM Identity Center, AWS Secrets Manager)
+ Securing external network connections to and from the AWS Cloud (for example, VPN, AWS Direct Connect)

## Task 1.3: Determine appropriate data security controls
<a name="solutions-architect-associate-03-domain1-task3"></a>

Knowledge of:
+ Data access and governance
+ Data recovery
+ Data retention and classification
+ Encryption and appropriate key management

Skills in:
+ Aligning AWS technologies to meet compliance requirements
+ Encrypting data at rest (for example, AWS KMS)
+ Encrypting data in transit (for example, AWS Certificate Manager [ACM] using TLS)
+ Implementing access policies for encryption keys
+ Implementing data backups and replications
+ Implementing policies for data access, lifecycle, and protection
+ Rotating encryption keys and renewing certificates



# Content Domain 2: Design Resilient Architectures
<a name="solutions-architect-associate-03-domain2"></a>

**Topics**
+ [Task 2.1: Design scalable and loosely coupled architectures](#solutions-architect-associate-03-domain2-task1)
+ [Task 2.2: Design highly available and/or fault-tolerant architectures](#solutions-architect-associate-03-domain2-task2)

## Task 2.1: Design scalable and loosely coupled architectures
<a name="solutions-architect-associate-03-domain2-task1"></a>

Knowledge of:
+ API creation and management (for example, Amazon API Gateway, REST API)
+ AWS managed services with appropriate use cases (for example, AWS Transfer Family, Amazon SQS, AWS Secrets Manager)
+ Caching strategies
+ Design principles for microservices (for example, stateless workloads compared with stateful workloads)
+ Event-driven architectures
+ Horizontal scaling and vertical scaling
+ How to appropriately use edge accelerators (for example, content delivery network [CDN])
+ How to migrate applications into containers
+ Load balancing concepts (for example, Application Load Balancer [ALB])
+ Multi-tier architectures
+ Queuing and messaging concepts (for example, publish/subscribe)
+ Serverless technologies and patterns (for example, AWS Fargate, AWS Lambda)
+ Storage types with associated characteristics (for example, object, file, block)
+ The orchestration of containers (for example, Amazon ECS, Amazon EKS)
+ When to use read replicas
+ Workflow orchestration (for example, AWS Step Functions)

Skills in:
+ Designing event-driven, microservice, and/or multi-tier architectures based on requirements
+ Determining scaling strategies for components used in an architecture design
+ Determining the AWS services required to achieve loose coupling based on requirements
+ Determining when to use containers
+ Determining when to use serverless technologies and patterns
+ Recommending appropriate compute, storage, networking, and database technologies based on requirements
+ Using purpose-built AWS services for workloads

## Task 2.2: Design highly available and/or fault-tolerant architectures
<a name="solutions-architect-associate-03-domain2-task2"></a>

Knowledge of:
+ AWS global infrastructure (for example, Availability Zones, AWS Regions, Amazon Route 53)
+ AWS Managed Services (AMS) with appropriate use cases (for example, Amazon Comprehend, Amazon Polly)
+ Basic networking concepts (for example, route tables)
+ Disaster recovery (DR) strategies (for example, backup and restore, pilot light, warm standby, active-active failover, recovery point objective [RPO], recovery time objective [RTO])
+ Distributed design patterns
+ Failover strategies
+ Immutable infrastructure
+ Load balancing concepts (for example, ALB)
+ Proxy concepts (for example, Amazon RDS Proxy)
+ Service quotas and throttling (for example, how to configure the service quotas for a workload in a standby environment)
+ Storage options and characteristics (for example, durability, replication)
+ Workload visibility (for example, AWS X-Ray)

Skills in:
+ Determining automation strategies to ensure infrastructure integrity
+ Determining the AWS services required to provide a highly available and/or fault-tolerant architecture across AWS Regions or Availability Zones
+ Identifying metrics based on business requirements to deliver a highly available solution
+ Implementing designs to mitigate single points of failure
+ Implementing strategies to ensure the durability and availability of data (for example, backups)
+ Selecting an appropriate DR strategy to meet business requirements
+ Using AWS services that improve the reliability of legacy applications and applications not built for the cloud (for example, when application changes are not possible)
+ Using purpose-built AWS services for workloads



# Content Domain 3: Design High-Performing Architectures
<a name="solutions-architect-associate-03-domain3"></a>

**Topics**
+ [Task 3.1: Determine high-performing and/or scalable storage solutions](#solutions-architect-associate-03-domain3-task1)
+ [Task 3.2: Design high-performing and elastic compute solutions](#solutions-architect-associate-03-domain3-task2)
+ [Task 3.3: Determine high-performing database solutions](#solutions-architect-associate-03-domain3-task3)
+ [Task 3.4: Determine high-performing and/or scalable network architectures](#solutions-architect-associate-03-domain3-task4)
+ [Task 3.5: Determine high-performing data ingestion and transformation solutions](#solutions-architect-associate-03-domain3-task5)

## Task 3.1: Determine high-performing and/or scalable storage solutions
<a name="solutions-architect-associate-03-domain3-task1"></a>

Knowledge of:
+ Hybrid storage solutions to meet business requirements
+ Storage services with appropriate use cases (for example, Amazon S3, Amazon EFS, Amazon EBS)
+ Storage types with associated characteristics (for example, object, file, block)

Skills in:
+ Determining storage services and configurations that meet performance demands
+ Determining storage services that can scale to accommodate future needs

## Task 3.2: Design high-performing and elastic compute solutions
<a name="solutions-architect-associate-03-domain3-task2"></a>

Knowledge of:
+ AWS compute services with appropriate use cases (for example, AWS Batch, Amazon EMR, AWS Fargate)
+ Distributed computing concepts supported by AWS global infrastructure and edge services
+ Queuing and messaging concepts (for example, publish/subscribe)
+ Scalability capabilities with appropriate use cases (for example, Amazon EC2 Auto Scaling, AWS Auto Scaling)
+ Serverless technologies and patterns (for example, AWS Lambda, Fargate)
+ The orchestration of containers (for example, Amazon ECS, Amazon EKS)

Skills in:
+ Decoupling workloads so that components can scale independently
+ Identifying metrics and conditions to perform scaling actions
+ Selecting the appropriate compute options and features (for example, EC2 instance types) to meet business requirements
+ Selecting the appropriate resource type and size (for example, the amount of Lambda memory) to meet business requirements

## Task 3.3: Determine high-performing database solutions
<a name="solutions-architect-associate-03-domain3-task3"></a>

Knowledge of:
+ AWS global infrastructure (for example, Availability Zones, AWS Regions)
+ Caching strategies and services (for example, Amazon ElastiCache)
+ Data access patterns (for example, read-intensive compared with write-intensive)
+ Database capacity planning (for example, capacity units, instance types, Provisioned IOPS)
+ Database connections and proxies
+ Database engines with appropriate use cases (for example, heterogeneous migrations, homogeneous migrations)
+ Database replication (for example, read replicas)
+ Database types and services (for example, serverless, relational compared with non-relational, in-memory)

Skills in:
+ Configuring read replicas to meet business requirements
+ Designing database architectures
+ Determining an appropriate database engine (for example, MySQL compared with PostgreSQL)
+ Determining an appropriate database type (for example, Amazon Aurora, Amazon DynamoDB)
+ Integrating caching to meet business requirements

## Task 3.4: Determine high-performing and/or scalable network architectures
<a name="solutions-architect-associate-03-domain3-task4"></a>

Knowledge of:
+ Edge networking services with appropriate use cases (for example, Amazon CloudFront, AWS Global Accelerator)
+ How to design network architecture (for example, subnet tiers, routing, IP addressing)
+ Load balancing concepts (for example, Application Load Balancer)
+ Network connection options (for example, AWS VPN, AWS Direct Connect, AWS PrivateLink)

Skills in:
+ Creating a network topology for various architectures (for example, global, hybrid, multi-tier)
+ Determining network configurations that can scale to accommodate future needs
+ Determining the appropriate placement of resources to meet business requirements
+ Selecting the appropriate load balancing strategy

## Task 3.5: Determine high-performing data ingestion and transformation solutions
<a name="solutions-architect-associate-03-domain3-task5"></a>

Knowledge of:
+ Data analytics and visualization services with appropriate use cases (for example, Amazon Athena, AWS Lake Formation, Amazon QuickSuite)
+ Data ingestion patterns (for example, frequency)
+ Data transfer services with appropriate use cases (for example, AWS DataSync, AWS Storage Gateway)
+ Data transformation services with appropriate use cases (for example, AWS Glue)
+ Secure access to ingestion access points
+ Sizes and speeds needed to meet business requirements
+ Streaming data services with appropriate use cases (for example, Amazon Kinesis)

Skills in:
+ Building and securing data lakes
+ Designing data streaming architectures
+ Designing data transfer solutions
+ Implementing visualization strategies
+ Selecting appropriate compute options for data processing (for example, Amazon EMR)
+ Selecting appropriate configurations for ingestion
+ Transforming data between formats (for example, .csv to .parquet)



# Content Domain 4: Design Cost-Optimized Architectures
<a name="solutions-architect-associate-03-domain4"></a>

**Topics**
+ [Task 4.1: Design cost-optimized storage solutions](#solutions-architect-associate-03-domain4-task1)
+ [Task 4.2: Design cost-optimized compute solutions](#solutions-architect-associate-03-domain4-task2)
+ [Task 4.3: Design cost-optimized database solutions](#solutions-architect-associate-03-domain4-task3)
+ [Task 4.4: Design cost-optimized network architectures](#solutions-architect-associate-03-domain4-task4)

## Task 4.1: Design cost-optimized storage solutions
<a name="solutions-architect-associate-03-domain4-task1"></a>

Knowledge of:
+ Access options (for example, an S3 bucket with Requester Pays object storage)
+ AWS cost management service features (for example, cost allocation tags, multi-account billing)
+ AWS cost management tools with appropriate use cases (for example, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report)
+ AWS storage services with appropriate use cases (for example, Amazon FSx, Amazon EFS, Amazon S3, Amazon EBS)
+ Backup strategies
+ Block storage options (for example, hard disk drive [HDD] volume types, solid state drive [SSD] volume types)
+ Data lifecycles
+ Hybrid storage options (for example, AWS DataSync, AWS Transfer Family, AWS Storage Gateway)
+ Storage access patterns
+ Storage tiering (for example, cold tiering for object storage)
+ Storage types with associated characteristics (for example, object, file, block)

Skills in:
+ Designing appropriate storage strategies (for example, batch uploads to Amazon S3 compared with individual uploads)
+ Determining the correct storage size for a workload
+ Determining the lowest cost method of transferring data for a workload to AWS storage
+ Determining when storage auto scaling is required
+ Managing S3 object lifecycles
+ Selecting the appropriate backup and/or archival solution
+ Selecting the appropriate service for data migration to storage services
+ Selecting the appropriate storage tier
+ Selecting the correct data lifecycle for storage
+ Selecting the most cost-effective storage service for a workload

## Task 4.2: Design cost-optimized compute solutions
<a name="solutions-architect-associate-03-domain4-task2"></a>

Knowledge of:
+ AWS cost management service features (for example, cost allocation tags, multi-account billing)
+ AWS cost management tools with appropriate use cases (for example, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report)
+ AWS global infrastructure (for example, Availability Zones, AWS Regions)
+ AWS purchasing options (for example, Spot Instances, Reserved Instances, Savings Plans)
+ Distributed compute strategies (for example, edge processing)
+ Hybrid compute options (for example, AWS Outposts)
+ Instance types, families, and sizes (for example, memory optimized, compute optimized, virtualization)
+ Optimization of compute utilization (for example, containers, serverless computing, microservices)
+ Scaling strategies (for example, auto scaling, hibernation)

Skills in:
+ Determining an appropriate load balancing strategy (for example, Application Load Balancer [Layer 7] compared with Network Load Balancer [Layer 4] compared with Gateway Load Balancer)
+ Determining appropriate scaling methods and strategies for elastic workloads (for example, horizontal compared with vertical, EC2 hibernation)
+ Determining cost-effective AWS compute services with appropriate use cases (for example, AWS Lambda, Amazon EC2, AWS Fargate)
+ Determining the required availability for different classes of workloads (for example, production workloads, non-production workloads)
+ Selecting the appropriate instance family for a workload
+ Selecting the appropriate instance size for a workload

## Task 4.3: Design cost-optimized database solutions
<a name="solutions-architect-associate-03-domain4-task3"></a>

Knowledge of:
+ AWS cost management service features (for example, cost allocation tags, multi-account billing)
+ AWS cost management tools with appropriate use cases (for example, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report)
+ Caching strategies
+ Data retention policies
+ Database capacity planning (for example, capacity units)
+ Database connections and proxies
+ Database engines with appropriate use cases (for example, heterogeneous migrations, homogeneous migrations)
+ Database replication (for example, read replicas)
+ Database types and services (for example, relational compared with non-relational, Amazon Aurora, Amazon DynamoDB)

Skills in:
+ Designing appropriate backup and retention policies (for example, snapshot frequency)
+ Determining an appropriate database engine (for example, MySQL compared with PostgreSQL)
+ Determining cost-effective AWS database services with appropriate use cases (for example, DynamoDB compared with Amazon RDS, serverless)
+ Determining cost-effective AWS database types (for example, time series format, columnar format)
+ Migrating database schemas and data to different locations and/or different database engines

## Task 4.4: Design cost-optimized network architectures
<a name="solutions-architect-associate-03-domain4-task4"></a>

Knowledge of:
+ AWS cost management service features (for example, cost allocation tags, multi-account billing)
+ AWS cost management tools with appropriate use cases (for example, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report)
+ Load balancing concepts (for example, Application Load Balancer)
+ NAT gateways (for example, NAT instance costs compared with NAT gateway costs)
+ Network connectivity (for example, private lines, dedicated lines, VPNs)
+ Network routing, topology, and peering (for example, AWS Transit Gateway, VPC peering)
+ Network services with appropriate use cases (for example, DNS)

Skills in:
+ Configuring appropriate NAT gateway types for a network (for example, a single shared NAT gateway compared with NAT gateways for each Availability Zone)
+ Configuring appropriate network connections (for example, AWS Direct Connect compared with VPN compared with internet)
+ Configuring appropriate network routes to minimize network transfer costs (for example, Region to Region, Availability Zone to Availability Zone, private to public, AWS Global Accelerator, VPC endpoints)
+ Determining strategic needs for content delivery networks (CDNs) and edge caching
+ Reviewing existing workloads for network optimizations
+ Selecting an appropriate throttling strategy
+ Selecting the appropriate bandwidth allocation for a network device (for example, a single VPN compared with multiple VPNs, Direct Connect speed)



# Technologies and Concepts
<a name="saa-technologies-concepts"></a>

The following list contains technologies and concepts that might appear on the exam. This list is non-exhaustive and is subject to change. The order and placement of the items in this list is no indication of their relative weight or importance on the exam:
+ Compute
+ Cost management
+ Database
+ Disaster recovery
+ High performance
+ Management and governance
+ Microservices and component delivery
+ Migration and data transfer
+ Networking, connectivity, and content delivery
+ Resiliency
+ Security
+ Serverless and event-driven design principles
+ Storage



# Mentions of AWS Services on the Exam
<a name="saa-service-mentions"></a>

AWS Certification is reducing the reading load on this exam by using official short names for well-known AWS service names that contain abbreviations or parenthetical information. For example, *Amazon Simple Notification Service (Amazon SNS)* appears on the exam as *Amazon SNS*.
+ The Help feature in the exam (available for every question) contains the list of the short AWS service names and their corresponding full names.
+ You can consult [AWS Service Names](https://aws.amazon.com/certification/policies/general-information/) on the AWS Certification website for the list of services that appear as their short names on the exam. Any services that are on the list but that are out of scope for the exam will not appear on the exam.

**Note:** Not every abbreviation is fully spelled out on the exam or available in the Help feature. The official full name for some AWS services includes an abbreviation that is never expanded (for example, Amazon API Gateway, Amazon EMR). The exam also might contain other abbreviations that the target audience is expected to know.



# In-Scope AWS Services
<a name="saa-03-in-scope-services"></a>

The following list contains AWS services and features that are in scope for the exam. This list is non-exhaustive and is subject to change. AWS offerings appear in categories that align with the offerings' primary functions:

**Topics**
+ [Analytics](#saa-03-in-scope-analytics)
+ [Application Integration](#saa-03-in-scope-application-integration)
+ [AWS Cost Management](#saa-03-in-scope-cost-management)
+ [Compute](#saa-03-in-scope-compute)
+ [Containers](#saa-03-in-scope-containers)
+ [Database](#saa-03-in-scope-database)
+ [Developer Tools](#saa-03-in-scope-developer-tools)
+ [Front-End Web and Mobile](#saa-03-in-scope-frontend-web-mobile)
+ [Machine Learning](#saa-03-in-scope-machine-learning)
+ [Management and Governance](#saa-03-in-scope-management-governance)
+ [Media Services](#saa-03-in-scope-media-services)
+ [Migration and Transfer](#saa-03-in-scope-migration-transfer)
+ [Networking and Content Delivery](#saa-03-in-scope-networking)
+ [Security, Identity, and Compliance](#saa-03-in-scope-security)
+ [Serverless](#saa-03-in-scope-serverless)
+ [Storage](#saa-03-in-scope-storage)

## Analytics
<a name="saa-03-in-scope-analytics"></a>
+ Amazon Athena
+ AWS Data Exchange
+ Amazon Data Firehose
+ Amazon EMR
+ AWS Glue
+ Amazon Kinesis
+ AWS Lake Formation
+ Amazon Managed Streaming for Apache Kafka (Amazon MSK)
+ Amazon OpenSearch Service
+ Amazon QuickSuite
+ Amazon Redshift

## Application Integration
<a name="saa-03-in-scope-application-integration"></a>
+ Amazon AppFlow
+ AWS AppSync
+ Amazon EventBridge
+ Amazon MQ
+ Amazon SNS
+ Amazon SQS
+ AWS Step Functions

## AWS Cost Management
<a name="saa-03-in-scope-cost-management"></a>
+ AWS Budgets
+ AWS Cost and Usage Report
+ AWS Cost Explorer
+ Savings Plans

## Compute
<a name="saa-03-in-scope-compute"></a>
+ AWS Batch
+ Amazon EC2
+ Amazon EC2 Auto Scaling
+ AWS Elastic Beanstalk
+ AWS Outposts
+ AWS Serverless Application Repository
+ VMware Cloud on AWS
+ AWS Wavelength

## Containers
<a name="saa-03-in-scope-containers"></a>
+ Amazon ECR
+ Amazon ECS
+ Amazon ECS Anywhere
+ Amazon EKS
+ Amazon EKS Anywhere
+ Amazon EKS Distro

## Database
<a name="saa-03-in-scope-database"></a>
+ Amazon Aurora
+ Amazon Aurora Serverless
+ Amazon DocumentDB
+ Amazon DynamoDB
+ Amazon ElastiCache
+ Amazon Keyspaces
+ Amazon Neptune
+ Amazon RDS
+ Amazon Redshift

## Developer Tools
<a name="saa-03-in-scope-developer-tools"></a>
+ AWS X-Ray

## Front-End Web and Mobile
<a name="saa-03-in-scope-frontend-web-mobile"></a>
+ AWS Amplify
+ Amazon API Gateway
+ AWS Device Farm

## Machine Learning
<a name="saa-03-in-scope-machine-learning"></a>
+ Amazon Comprehend
+ Amazon Kendra
+ Amazon Lex
+ Amazon Polly
+ Amazon Rekognition
+ Amazon SageMaker AI
+ Amazon Textract
+ Amazon Transcribe
+ Amazon Translate

## Management and Governance
<a name="saa-03-in-scope-management-governance"></a>
+ AWS Auto Scaling
+ AWS CLI
+ AWS CloudFormation
+ AWS CloudTrail
+ Amazon CloudWatch
+ AWS Compute Optimizer
+ AWS Config
+ AWS Control Tower
+ AWS Health Dashboard
+ AWS License Manager
+ Amazon Managed Grafana
+ Amazon Managed Service for Prometheus
+ AWS Management Console
+ AWS Organizations
+ AWS Service Catalog
+ AWS Systems Manager
+ AWS Trusted Advisor
+ AWS Well-Architected Tool

## Media Services
<a name="saa-03-in-scope-media-services"></a>
+ Amazon Elastic Transcoder
+ Amazon Kinesis Video Streams

## Migration and Transfer
<a name="saa-03-in-scope-migration-transfer"></a>
+ AWS Application Migration Service
+ AWS DataSync
+ AWS DMS
+ AWS Snow Family
+ AWS Transfer Family

## Networking and Content Delivery
<a name="saa-03-in-scope-networking"></a>
+ AWS Client VPN
+ Amazon CloudFront
+ AWS Direct Connect
+ Elastic Load Balancing (ELB)
+ AWS Global Accelerator
+ AWS PrivateLink
+ Amazon Route 53
+ AWS Site-to-Site VPN
+ AWS Transit Gateway
+ Amazon VPC

## Security, Identity, and Compliance
<a name="saa-03-in-scope-security"></a>
+ AWS Artifact
+ AWS Audit Manager
+ AWS Certificate Manager (ACM)
+ AWS CloudHSM
+ Amazon Cognito
+ Amazon Detective
+ AWS Directory Service
+ AWS Firewall Manager
+ Amazon GuardDuty
+ AWS IAM Identity Center
+ Amazon Inspector
+ AWS KMS
+ Amazon Macie
+ AWS Network Firewall
+ AWS Resource Access Manager (AWS RAM)
+ AWS Secrets Manager
+ AWS Security Hub
+ AWS Shield
+ AWS WAF
+ IAM

## Serverless
<a name="saa-03-in-scope-serverless"></a>
+ AWS AppSync
+ AWS Fargate
+ AWS Lambda

## Storage
<a name="saa-03-in-scope-storage"></a>
+ AWS Backup
+ Amazon EBS
+ Amazon EFS
+ Amazon FSx (for all types)
+ Amazon S3
+ Amazon S3 Glacier
+ AWS Storage Gateway



# Out-of-Scope AWS Services
<a name="saa-03-out-of-scope-services"></a>

The following list contains AWS services and features that are out of scope for the exam. This list is non-exhaustive and is subject to change. AWS offerings that are entirely unrelated to the target job roles for the exam are excluded from this list:

**Topics**
+ [Application Integration](#saa-03-out-of-scope-application-integration)
+ [AR and VR](#saa-03-out-of-scope-ar-vr)
+ [Blockchain](#saa-03-out-of-scope-blockchain)
+ [Compute](#saa-03-out-of-scope-compute)
+ [Database](#saa-03-out-of-scope-database)
+ [Developer Tools](#saa-03-out-of-scope-developer-tools)
+ [Front-End Web and Mobile](#saa-03-out-of-scope-front-end-web-mobile)
+ [Game Tech](#saa-03-out-of-scope-game-tech)
+ [Internet of Things](#saa-03-out-of-scope-iot)
+ [Machine Learning](#saa-03-out-of-scope-machine-learning)
+ [Management and Governance](#saa-03-out-of-scope-management-governance)
+ [Media Services](#saa-03-out-of-scope-media-services)
+ [Migration and Transfer](#saa-03-out-of-scope-migration-transfer)
+ [Networking and Content Delivery](#saa-03-out-of-scope-networking-content-delivery)
+ [Quantum Technologies](#saa-03-out-of-scope-quantum-technologies)
+ [Satellite](#saa-03-out-of-scope-satellite)

## Application Integration
<a name="saa-03-out-of-scope-application-integration"></a>
+ Amazon Managed Workflows for Apache Airflow (Amazon MWAA)

## AR and VR
<a name="saa-03-out-of-scope-ar-vr"></a>
+ Amazon Sumerian

## Blockchain
<a name="saa-03-out-of-scope-blockchain"></a>
+ Amazon Managed Blockchain

## Compute
<a name="saa-03-out-of-scope-compute"></a>
+ Amazon Lightsail

## Database
<a name="saa-03-out-of-scope-database"></a>
+ Amazon RDS on VMware

## Developer Tools
<a name="saa-03-out-of-scope-developer-tools"></a>
+ AWS CDK
+ AWS CloudShell
+ AWS CodeArtifact
+ AWS CodeBuild
+ AWS CodeCommit
+ AWS CodeDeploy
+ Amazon Corretto
+ AWS Fault Injection Simulator (AWS FIS)
+ AWS Tools and SDKs

## Front-End Web and Mobile
<a name="saa-03-out-of-scope-front-end-web-mobile"></a>
+ Amazon Location Service

## Game Tech
<a name="saa-03-out-of-scope-game-tech"></a>
+ Amazon GameLift

## Internet of Things
<a name="saa-03-out-of-scope-iot"></a>
+ All services

## Machine Learning
<a name="saa-03-out-of-scope-machine-learning"></a>
+ Apache MXNet on AWS
+ Amazon Augmented AI (Amazon A2I)
+ AWS DeepComposer
+ AWS Deep Learning AMIs (DLAMI)
+ AWS Deep Learning Containers
+ Amazon DevOps Guru
+ Amazon Elastic Inference
+ Amazon HealthLake
+ AWS Inferentia
+ Amazon Personalize
+ PyTorch on AWS
+ Amazon SageMaker Canvas
+ Amazon SageMaker Ground Truth
+ TensorFlow on AWS

## Management and Governance
<a name="saa-03-out-of-scope-management-governance"></a>
+ AWS Console Mobile Application
+ AWS Distro for OpenTelemetry

## Media Services
<a name="saa-03-out-of-scope-media-services"></a>
+ AWS Elemental Appliances and Software
+ AWS Elemental MediaConnect
+ AWS Elemental MediaConvert
+ AWS Elemental MediaLive
+ AWS Elemental MediaPackage
+ AWS Elemental MediaTailor
+ Amazon Interactive Video Service (Amazon IVS)

## Migration and Transfer
<a name="saa-03-out-of-scope-migration-transfer"></a>
+ Migration Evaluator

## Networking and Content Delivery
<a name="saa-03-out-of-scope-networking-content-delivery"></a>
+ AWS Cloud Map

## Quantum Technologies
<a name="saa-03-out-of-scope-quantum-technologies"></a>
+ Amazon Braket

## Satellite
<a name="saa-03-out-of-scope-satellite"></a>
+ AWS Ground Station