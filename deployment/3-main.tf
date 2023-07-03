terraform {
	backend "s3" {
		bucket = "sociaza-terraform-state"
		key = "develop/sociaza.tfstate"
		region = var.aws_region
		encrypt = true
	}
}

locals {
	prefix = "${var.prefix}-${terraform.workspace}",
	common_tags = {
		Environment = terraform.workspace,
		Project = var.project,
		ManagedBy = "Terraform",
		Owner = "Pratham"
	}
}