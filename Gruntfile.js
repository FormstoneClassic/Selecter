/*global module:false*/
module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			name:     'selecter',
			codename: 'jquery.fs.selecter',
			url: {
				docs: 'http://www.benplum.com/formstone/selecter/',
				repo: 'https://github.com/benplum/Selecter/issues'
			},
			banner: '/* \n' + 
					' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> \n' +
					' * <%= pkg.description %> \n' +
					' * <%= pkg.homepage %> \n' +
					' * \n' +
					' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; <%= pkg.license %> Licensed \n' +
					' */ \n\n'
		},
		// JS Hint
		jshint: {
			options: {
				globals: {
					'window': true,
					'jQuery': true
				},
				curly:     true,
				eqeqeq:    true,
				forin:     true,
				freeze:    true,
				nonew:     true,
				immed:	   true,
				latedef:   true,
				newcap:    true,
				noarg:     true,
				sub:       true,
				undef:     true,
				smarttabs: true
			},
			files: ['src/<%= meta.codename %>.js']
		},
		// Concat
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			js: {
				src: 'src/<%= meta.codename %>.js',
				dest: '<%= meta.codename %>.js'
			},
			css: {
				src: 'src/<%= meta.codename %>.css',
				dest: '<%= meta.codename %>.css'
			}
		},
		// Uglify
		uglify: {
			options: {
				banner: '<%= meta.banner %>',
				report: 'min'
			},
			target: {
				files: {
					'<%= meta.codename %>.min.js': [ '<%= meta.codename %>.js' ]
				}
			}
		},
		// jQuery Manifest
		jquerymanifest: {
			options: {
				source: grunt.file.readJSON('package.json'),
				overrides: {
					name: '<%= meta.name %>',
					keywords: [ 'select', 'input', 'ui', 'formstone', 'benplum' ],
					homepage: '<%= meta.url.docs %>',
					docs: 	  '<%= meta.url.docs %>',
					demo: 	  '<%= meta.url.docs %>',
					download: '<%= meta.url.repo %>',
					bugs: 	  '<%= meta.url.repo %>',
					dependencies: {
						jquery: '>=1.7'
					}
				}
			}
		},
		//Bower sync
		sync: {
			all: {
				options: {
					sync: [ 'name', 'version', 'description', 'author', 'license', 'homepage' ]
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-jquerymanifest');
	grunt.loadNpmTasks('grunt-npm2bower-sync');
	
	// Default task.
	grunt.registerTask('default', [ 'jshint', 'concat', 'uglify', 'jquerymanifest', 'sync' ]);

};