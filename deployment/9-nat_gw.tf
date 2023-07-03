#resource "aws_nat_gateway" "nat_gw" {
#	allocation_id = aws_eip.elastic_ip.id
#	subnet_id = aws_subnet.public_subnet_a.id
#}
