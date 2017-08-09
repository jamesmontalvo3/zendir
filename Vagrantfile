# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  # config.vm.box = "ubuntu/trusty64"
  config.vm.box = "bento/centos-7.3"
  config.vm.network :private_network, ip: "192.168.56.10"

  config.vm.provider :virtualbox do |v|
    v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    v.customize ['modifyvm', :id, '--cableconnected1', 'on']
    v.customize ["modifyvm", :id, "--memory", 4096 ]
    v.customize ["modifyvm", :id, "--cpus", 2 ]
    v.customize ["modifyvm", :id, "--name", "zendir"]
  end

  config.vm.provision "shell", inline: <<-SHELL
    bash /vagrant/setup.sh
    bash /vagrant/setup-db.sh
  SHELL
end
