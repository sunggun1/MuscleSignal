variable "AWS_ACCESS_KEY" {
  default = ""
}

variable "AWS_SECRET_KEY" {
  default = ""
}

variable "AWS_REGION" {
  default = "ap-northeast-2"
}

# prj
variable "project_name" { default= "muscleTech" } 
variable "environment" { default="prod" }

# network
variable "cidr_vpc"        { default = "10.0.0.0/16"}
variable "cidr_public1"    { default = "10.0.0.0/24" }
variable "cidr_public2"    { default = "10.0.1.0/24" }
variable "cidr_public3"    { default = "10.0.2.0/24" }
variable "cidr_public4"    { default = "10.0.3.0/24" }
variable "cidr_private1"   { default = "10.0.11.0/24" }
variable "cidr_private2"   { default = "10.0.12.0/24" }
variable "cidr_private3"   { default = "10.0.13.0/24" }
variable "cidr_private4"   { default = "10.0.14.0/24" }

# Bastion
variable "bastion_ami" { default="ami-09cf633fe86e51bf0" }
variable "bastion_instance_type" { default="t3.micro" }
variable "bastion_key_name" {default="python"}
variable "bastion_volume_size" {default="30"}

# Private EC2
variable "Private_EC2_ami" { default="ami-09cf633fe86e51bf0" }
variable "Private_EC2_instance_type" { default="t3.micro"}
variable "Private_EC2_key_name" {default="python"}
variable "Private_EC2_volume_size" {default="30"}